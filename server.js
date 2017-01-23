var logger = require("./log.js").getInstance("SERVER");

var SerialManager = require("./SerialManager.js");

SerialManager.on("ports.onchange", function(ports) {
  logger.info(ports);
});

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

io.on("connection", function(socket) {
  socket.on("register", function(room) {
    socket.join(room);
  });
});