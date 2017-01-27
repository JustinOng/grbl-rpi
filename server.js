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

let grbl_instance = new Grbl("COM8");

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