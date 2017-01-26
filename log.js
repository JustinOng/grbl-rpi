'use strict';

//http://stackoverflow.com/questions/14531232/using-winston-in-several-modules
var winston = require("winston"),
    util = require("util"),
    utils = require("./utils.js");

var ClassLogger = winston.transports.ClassLogger = function(options) {
  if (typeof options === "undefined") {
    options = {};
  }
  
  this.name = "ClassLogger";
  this.level = options.level || "info";
}

util.inherits(ClassLogger, winston.Transport);

ClassLogger.prototype.log = function(level, msg, meta, callback) {
  var d = new Date();
  
  var datestring = "{0}/{1}/{2} {3}:{4}:{5}".format(d.getDate(), d.getMonth()+1, d.getFullYear(), utils.leftpad(d.getHours(), 2), utils.leftpad(d.getMinutes(), 2), utils.leftpad(d.getSeconds(), 2));
  
  if (meta["name"]) {
    console.log("{0} {1} [{2}]: {3}".format(datestring, utils.rightpad(level.toUpperCase(), 5, " "), meta["name"], msg));
  }
  else {
    console.log("{0} {1}: {2}".format(datestring, level.toUpperCase(), msg)) ;
  }
  
  callback(null, true);
};

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.ClassLogger)()
  ]
});
logger.transports.ClassLogger.level = "debug";

var ClassLoggerFactory = function(short_name) {
  this.debug = function(msg) {
    logger.debug(msg, {"name": short_name});
  };
  
  this.info = function(msg) {
    logger.info(msg, {"name": short_name});
  };
  
  this.warn = function(msg) {
    logger.warn(msg, {"name": short_name});
  };
  
  this.error = function(msg) {
    logger.error(msg, {"name": short_name});
  };
}

module.exports = logger;
// just so that I can call it as logger.getInstance("short name");
module.exports.getInstance = function(short_name) {
  return new ClassLoggerFactory(short_name);
};