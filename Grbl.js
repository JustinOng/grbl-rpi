'use strict';

let config = require("./config.js");
let SerialPort = require("serialport");
let logger = require("./log.js");

let Grbl = function(port_name) {
  let self = this;
  
  this.port_name = port_name;
  
  this.logger = logger.getInstance("GRBL - {0}".format(this.port_name));
  
  this.serial_port = new SerialPort(port_name, {
    baudRate: config.uart_rate,
    parser: SerialPort.parsers.readline("\r\n")
  });
  
  this.serial_port.on("open", function(data) {
    self.logger.info("Open: {0}".format(data));
  });
  
  this.serial_port.on("data", function(line) {
    // something funky with the splitting of lines
    if (line.length === 0) return;
    
    self.logger.info("Data: {0}".format(line));
  });
}

module.exports = Grbl;