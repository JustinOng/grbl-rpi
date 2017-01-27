'use strict';

let config = require("./config.js");
let logger = require("./log.js");
let CSVCodes = require("./CSVCodes.js");

let SerialPort = require("serialport");
let util = require("util");

let EventEmitter = require('events').EventEmitter;

let Grbl = function(port_name) {
  let self = this;
  
  this.port_name = port_name;
  
  this.logger = logger.getInstance("GRBL - {0}".format(this.port_name));
  
  this.pending_commands = [];
  
  this.serial_port = new SerialPort(port_name, {
    baudRate: config.uart_rate,
    parser: SerialPort.parsers.readline("\r\n")
  });
  
  this.serial_port.on("open", function(data) {
    self.logger.info("Port open");
  });
  
  this.serial_port.on("close", function(data) {
    self.logger.info("Port closed");
  });
  
  this.serial_port.on("data", self.process_line.bind(self));
  
  /*setInterval(function() {
    if (!self.serial_port.isOpen()) return;
    
    self.serial_port.write("?");
  }, config.status_report_poll_interval);*/
}

Grbl.prototype.process_line = function(line) {
  let self = this;
  
  // something funky with the splitting of lines
  if (line.length === 0) return;
  
  //self.logger.info(line);
  
  if (line === "ok" || line.startsWith("error:")) {
    self.acknowledge_command(line);
    return;
  }
  
  // handles welcome messages
  if (line.startsWith("Grbl")) {
    self.logger.info("GRBL initialised!");
    
    self.emit("initialised");
  }
  // handles alarm messages
  else if (line.startsWith("ALARM:")) {
    let alarm_code = line.substring(6, line.length);
    
    if (!alarm_code in CSVCodes.alarm_codes) {
      logger.warn("Unknown error code: {0}".format(alarm_code));
      return;
    }
    
    logger.error("ALARM: {0}".format(CSVCodes.alarm_codes[alarm_code].message));
    
    self.emit("alarm", CSVCodes.alarm_codes[alarm_code]);
  }
  // handles settings messages
  else if (line.startsWith("$")) {
    
  }
  // handles non-queried feedback messages
  else if (/^\[MSG:(.+)\]/.test(line)) {
    let message = line.substring(5, line.length-1);
    
    logger.info("Message: {0}".format(message));
    
    self.emit("message", message);
  }
  // handles real-time status reports
  else if (/^<(.+)>/.test(line)) {
    let data_fields = line.substring(1, line.length-1).split("|");
    //console.log(data_fields);
  }
  else {
    self.logger.warn("Unhandled line: {0}".format(line));
  }
}

Grbl.prototype.has_pending_commands = function() {
  return this.pending_commands.length > 0;
}

Grbl.prototype.send_command = function(input) {
  
  let cmds = input.split(/\r?\n/);
  
  for(var cmd of cmds) {    
    this.pending_commands.push(cmd);
    
    this.logger.info("Sending {0}".format(cmd));
    this.serial_port.write(cmd+"\n");
  }
}

Grbl.prototype.acknowledge_command = function(line) {
  if (!this.has_pending_commands) {
    this.logger.warn("Received ack '{0}' but no pending commands?".format(line));
    return;
  }
  
  let command = this.pending_commands.shift();
  
  this.logger.info("Received ack '{0}' for '{1}'".format(line, command));
}

util.inherits(Grbl, EventEmitter);

module.exports = Grbl;