'use strict';

var logger = require("./log.js").getInstance("SerialManager");
var config = require("./config.js");
var SerialPort = require('serialport');

var fs = require("fs");
var USB_IDs = {};

fs.readFile(config.usb_id_list, "ascii", function(err, data) {
  if (err) return logger.warn("Failed to load {0}: {1}".format(config.usb_id_list, err));
  
  /*
    Parse http://www.linux-usb.org/usb.ids into an object for easy searching
  */
  
  var lines = data.split("\n");
  
  var vendor_count = 0;
  var product_count = 0;
  
  var vendor = "";
  
  for(var line of lines) {    
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

var SerialManager = function() {
  var self = this;
  
  this.ports = [];
  
  this._callbacks = {
    "ports.onchange": []
  }
  
  setInterval(function() {
    self.update();
  }, 500);
}

SerialManager.prototype.on = function(event_name, cb) {
  if (event_name in this._callbacks) {
    this._callbacks[event_name].push(cb);
  }
}

SerialManager.prototype._trigger = function(event_name) {
  //https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/arguments
  var args = Array.prototype.slice.call(arguments, 1);
    
  for(var cb of this._callbacks[event_name]) {
    cb.apply(null, args);
  }
}

SerialManager.prototype.update = function() {
  var self = this;
  
  SerialPort.list(function (err, ports) {
    if (err) {
      logger.warn("Error listing serial ports: {0}".format(err));
      return;
    }
    
    var current_ports = {};
    
    for (var port of ports) {
      var vendorId = port.vendorId.toLowerCase();
      var productId = port.productId.toLowerCase();
      current_ports[port.comName] = {};
      
      if (USB_IDs[vendorId]) {
        current_ports[port.comName].vendor = USB_IDs[vendorId].vendor_name;
        
        if (USB_IDs[vendorId].devices[productId]) {
          current_ports[port.comName].product = USB_IDs[vendorId].devices[productId];
        }
      }
    }
    
    if (JSON.stringify(self.ports) !== JSON.stringify(current_ports)) {
      self._trigger("ports.onchange", current_ports);
    
      self.ports = current_ports;
    }
  });
}

module.exports = new SerialManager();