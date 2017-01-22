var React = require("react");
var ReactDOM = require("react-dom");

var io = require("socket.io-client");

var Application = require("./components/Application.jsx");

ReactDOM.render(
  <Application/>,
  document.querySelector('#main')
);