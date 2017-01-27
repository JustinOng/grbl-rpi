var React = require("react");
var io = require("socket.io-client");

var Test = React.createClass({
  getInitialState: function() {
    return {
      ports: {}
    }
  },
  componentWillMount: function() {    
    var self = this;
    
    self.socket = new io();
  },
  send: function(cmd) {
    var self = this;
    
    return function() {
      self.socket.emit("command", cmd);
    }
  },
  render: function() {    
    return (
      <div>
        <button onClick={this.send("asdf\n$I")}>asdf</button>
        <button onClick={this.send("$G")}>$G</button>
      </div>
    );  
  }
});

module.exports = Test;