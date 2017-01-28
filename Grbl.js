'use strict';

let config = require("./config.js");
let logger = require("./log.js");
let CSVCodes = require("./CSVCodes.js");

let SerialManager = require("./SerialManager.js");
let util = require("util");

let EventEmitter = require('events').EventEmitter;

let Grbl = function() {
  let self = this;
  
  this.logger = logger.getInstance("GRBL");
  
  this.pending_commands = [];
  
  /*setInterval(function() {
    if (!self.serial_port.isOpen()) return;
    
    self.serial_port.write("?");
  }, config.status_report_poll_interval);*/
}

Grbl.prototype.begin = function(port_name) {
  this.port_name = port_name;
  
  SerialManager.begin(port_name);
  
  SerialManager.on("data", this.process_line.bind(this));
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
  //else if (line.startsWith("$")) {
    
  //}
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
  
  for(let cmd of cmds) {    
    this.pending_commands.push(cmd);
    
    this.logger.info("Sending {0}".format(cmd));
    SerialManager.write(cmd+"\n");
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