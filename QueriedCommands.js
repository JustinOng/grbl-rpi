// stores format of responses to various queried commands
module.exports = {
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
