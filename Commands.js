// stores format of request and replies to commands as necessary
module.exports = {
  requests: {
    eeprom_write: [
      new RegExp(/^G10L2/),
      new RegExp(/^G10L20/),
      new RegExp(/^G28.1/),
      new RegExp(/^G30.1/),
      new RegExp(/^\$(\d+)=/),
      new RegExp(/^\$I=/),
      new RegExp(/^\$N(\d+)=/),
      new RegExp(/^\$RST=/),
    ]
  },
  replies: {
    queried: {
      "$$": {
        name: "settings",
        regex: [
          new RegExp(/^\$(\d+)=(.+)/)
        ]
      },
      "$G": {
        name: "parser_state",
        regex: [
          new RegExp(/^\[(GC):(.+)\]/)
        ]
      },
      "$": {
        name: "help",
        regex: [
          new RegExp(/^\[(HLP):(.+)\]/)
        ]
      },
      "$#": {
        name: "gcode_parameters",
        regex: [
          new RegExp(/^\[(G\d+):(.+)\]/),
          new RegExp(/^\[(TLO):(.+)\]/),
          new RegExp(/^\[(PRB):(.+)\]/),
        ]
      },
      "$I": {
        name: "build_info",
        regex: [
          new RegExp(/^\[(VER):(.+)\]/),
          new RegExp(/^\[(OPT):(.+)\]/)
        ]
      }
    }
  }
}
