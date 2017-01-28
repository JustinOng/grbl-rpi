'use strict';

let logger = require("./log.js").getInstance("SerialManager");
let config = require("./config.js");
let SerialPort = require('serialport');

let fs = require("fs");
let util = require("util");

let EventEmitter = require('events').EventEmitter;

let USB_IDs = {};

fs.readFile(config.usb_id_list, "ascii", function(err, data) {
  if (err) return logger.warn("Failed to load {0}: {1}".format(config.usb_id_list, err));
  
  /*
    Parse http://www.linux-usb.org/usb.ids into an object for easy searching
  */
  
  let lines = data.split("\n");
  
  let vendor_count = 0;
  let product_count = 0;
  
  let vendor = "";
  
  for(let line of lines) {    
    // USB ids list ends at "# List of known device classes..."
    if (line.startsWith("# List of")) break;
    
    if (line.startsWith("#")) continue;
    
    if (/^\t\t/.test(line)) {
      // interface line
      
    }
    else if (/^\t/.test(line)) {
      // device line
      
      product_count++;
      
      line = line.trim().split("  ");
      
      USB_IDs[vendor]["devices"][line[0]] = line[1];
    }
    else {
      // vendor line
      
      vendor_count++;
      
      line = line.split("  ");
      vendor = line[0];
      
      USB_IDs[vendor] = {
        vendor_name: line[1],
        devices: {}
      }
    }
  }
  
  logger.info("Loaded {0} vendors and {1} products from {2}".format(vendor_count, product_count, config.usb_id_list));
});

let SerialManager = function() {
  /*
    ports.onchange
  */
  
  let self = this;
  
  this.ports = [];
  
  setInterval(function() {
    self.update_list();
  }, 500);
}

SerialManager.prototype.begin = function(port_name) {
  var self = this;
  
  this.port_name = port_name;
  
  this.serial_port = new SerialPort(port_name, {
    baudRate: config.uart_rate,
    parser: SerialPort.parsers.readline("\r\n")
  });
  
  this.serial_port.on("open", function() {
    logger.info("{0} open".format(self.port_name));
    self.emit("open")
  });
  
  this.serial_port.on("close", function() {
    logger.info("{0} closed".format(self.port_name));
    self.emit("close");
  });
  
  this.serial_port.on("data", function(line) {
    self.emit("data", line);
  });
}

SerialManager.prototype.write = function(data) {
  if (!this.serial_port) return;
  
  this.serial_port.write(data);
}

SerialManager.prototype.update_list = function() {
  let self = this;
  
  SerialPort.list(function (err, ports) {
    if (err) {
      logger.warn("Error listing serial ports: {0}".format(err));
      return;
    }
    
    let current_ports = {};
    
    for (let port of ports) {
      let vendorId = port.vendorId.toLowerCase();
      let productId = port.productId.toLowerCase();
      current_ports[port.comName] = {};
      
      if (USB_IDs[vendorId]) {
        current_ports[port.comName].vendor = USB_IDs[vendorId].vendor_name;
        
        if (USB_IDs[vendorId].devices[productId]) {
          current_ports[port.comName].product = USB_IDs[vendorId].devices[productId];
        }
      }
    }
    
    if (JSON.stringify(self.ports) !== JSON.stringify(current_ports)) {
      self.emit("ports.onchange", current_ports);
    
      self.ports = current_ports;
    }
  });
}

util.inherits(SerialManager, EventEmitter);

module.exports = new SerialManager();