'use strict';

var logger = require("./log.js").getInstance("SERVER");

var SerialManager = require("./SerialManager.js");
var Grbl = require("./Grbl.js");

var serve = require("koa-static");
var koa = require("koa");
var app = koa();
var mount = require("koa-mount");
var serve = require("koa-static");
var koa_router = require("koa-route");

app.use(mount("/", serve("./client")));

var server = require("http").createServer(app.callback()).listen(80);

logger.info("HTTP Server listening on port 80");

var io = require("socket.io")(server);

let grbl_instance = new Grbl();
grbl_instance.begin("COM8");

function emit_initial_data() {
  io.to("SerialManager").emit("ports.onchange", SerialManager.ports);
}

io.on("connection", function(socket) {
  socket.on("register", function(room) {
    socket.join(room);
    emit_initial_data();
  });

  socket.on("command", function(cmd) {
    grbl_instance.send_command(cmd);
  });
});

SerialManager.on("ports.onchange", function(ports) {
  io.to("SerialManager").emit("ports.onchange", ports);
});

grbl_instance.on("machine_state", function(state) {
  logger.info("Machine state: {0}".format(state));
});

grbl_instance.on("machine_position", function(position) {
  logger.info("Machine position: {0}".format(position));
});
