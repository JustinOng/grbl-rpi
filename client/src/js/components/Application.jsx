var React = require("react");
var io = require("socket.io-client");

var SerialManager = require("./SerialManager.jsx")

var Application = React.createClass({
  getInitialState: function() {
    return {
      server_connected: false
    };
  },
  componentWillMount: function() {
    var self = this;
    
    var socket = new io();
    
    socket.on("connect", function() {
      console.log("Connected");
      self.setState({server_connected: true});
    });
    
    socket.on("disconnect", function() {
      console.log("Disconnected");
      self.setState({server_connected: false});
    });
  },
  render: function() {
    return (
      <div>
        <SerialManager/>
        <div>
          {
            !this.state.server_connected ?
            <div id="connecting_overlay">
              <div>
                Connecting <i className='fa fa-refresh fa-spin'></i>
              </div>
            </div> :""
          }
        </div>
      </div>
    );
  }
});

module.exports = Application;