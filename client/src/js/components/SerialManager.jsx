var React = require("react");
var io = require("socket.io-client");

var SerialManager = React.createClass({
  getInitialState: function() {
    return {
      ports: {
        COM6: {
          vendor: "QinHeng Electronics",
          product: "HL-340 USB-Serial adapter"
        }
      }
    }
  },
  componentWillMount: function() {    
    var self = this;
    
    var socket = new io();
    
    socket.on("connect", function() {
      socket.emit("register", "SerialManager");
    });
    
    socket.on("ports.onchange", function(ports) {
      self.setState({ports: ports});
    });
  },
  render: function() {
    var ports = this.state.ports
    
    return (
      <div className="SerialManager">
        Serial Port: 
        <select>
        {
          Object.keys(ports).map(function(port_name) {
            return (
              <option value={port_name} key={port_name}>
                {port_name}
                {
                  ports[port_name].product ? " - "+ports[port_name].product:""
                }
              </option>
            );
          })
        }
        </select>
      </div>
    );  
  }
});

module.exports = SerialManager;