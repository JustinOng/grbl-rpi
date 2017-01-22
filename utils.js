var os = require("os");

//http://stackoverflow.com/a/4673436
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

module.exports.leftpad = function leftpad(value, length, fill) {
  if (typeof fill === "undefined") fill = "0";
  return (value.toString().length < length) ? leftpad(fill+value, length):value;
}

module.exports.rightpad = function rightpad(value, length, fill) {
  if (typeof fill === "undefined") fill = "0";
  return (value.toString().length < length) ? rightpad(value+fill, length):value;
}

module.exports.getIP = function() {
  if (os.networkInterfaces().wlan0) {
    return os.networkInterfaces().wlan0[0].address;
  }
  else {
    return false;
  }
}