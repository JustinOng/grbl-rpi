var logger = require("./log.js").getInstance("SerialManager");
var SerialPort = require('serialport');

var fs = require("fs");
var USB_IDs = {};

fs.readFile("usb.ids.txt", "ascii", function(err, data) {
  if (err) return logger.warn("Failed to load usb.ids.txt: {0}".format(err));
  
  /*
    Parse http://www.linux-usb.org/usb.ids into an object for easy searching
  */
  
  var lines = data.split("\n");
  
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
      line = line.trim().split("  ");
      
      USB_IDs[vendor]["devices"][line[0]] = line[1];
    }
    else {
      // vendor line
      line = line.split("  ");
      
      vendor = line[0];
      
      USB_IDs[vendor] = {
        vendor_name: line[1],
        devices: {}
      }
    }
  }
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