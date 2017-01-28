var React = require("react");
var io = require("socket.io-client");

var Test = React.createClass({
  getInitialState: function() {
    return {
      cmd: ""
    }
  },
  componentWillMount: function() {    
    var self = this;
    
    self.socket = new io();
  },
  send: function() {    
    this.socket.emit("command", this.state.cmd);
    this.setState({cmd: ""});
  },
  handleChange: function(evt) {
    this.setState({cmd: evt.target.value})
  },
  render: function() {    
    return (
      <div>
        <textarea type="text" value={this.state.cmd} onChange={this.handleChange}/>
        <button onClick={this.send}>Send</button>
      </div>
    );  
  }
});

module.exports = Test;