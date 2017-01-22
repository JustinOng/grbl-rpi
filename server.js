var logger = require("./log.js").getInstance("SERVER");

var serve = require("koa-static");
var koa = require("koa");
var app = koa();
var mount = require("koa-mount");
var serve = require("koa-static");
var koa_router = require("koa-route");

app.use(mount("/", serve("./client")));

var server = require("http").createServer(app.callback()).listen(80);
var io = require("socket.io")(server);