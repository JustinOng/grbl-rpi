'use strict';

let config = require("./config.js");
let SerialPort = require("serialport");
let logger = require("./log.js");
let CSVCodes = require("./CSVCodes.js");

let EventEmitter = require('events').EventEmitter;

let Grbl = function(port_name) {
  let self = this;
  
  this.port_name = port_name;
  
  this.logger = logger.getInstance("GRBL - {0}".format(this.port_name));
  
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
  
  this.serial_port.on("data", function(line) {
    // something funky with the splitting of lines
    if (line.length === 0) return;
    
    self.logger.info("Data: {0}".format(line));
    
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
    // handles feedback messages
    else if (/^\[(.+)\]/.test(line)) {
      
    }
    // handles real-time status reports
    else if (/^<(.+)>/.test(line)) {
      let data_fields = line.substring(1, line.length-1).split("|");
      console.log(data_fields);
    }
  });
  
  setInterval(function() {
    if (!self.serial_port.isOpen()) return;
    
    self.serial_port.write("?");
  }, config.status_report_poll_interval);
}

util.inherits(SerialManager, EventEmitter);

module.exports = Grbl;