'use strict';

let parse = require("csv-parse/lib/sync");
let fs = require("fs");

let csv_data = fs.readFileSync("./csv_codes/alarm_codes_en_US.csv", {
  encoding: "ascii"
});

let records = parse(csv_data);
// strip out first header row
records.shift();

let data = {};
for (let record of records) {
  data[record[0]] = {
    "message": record[1],
    "description": record[2]
  }
}

module.exports.alarm_codes = data;

csv_data = fs.readFileSync("./csv_codes/build_option_codes_en_US.csv", {
  encoding: "ascii"
});

records = parse(csv_data);
// strip out first header row
records.shift();

data = {};
for (let record of records) {
  data[record[0]] = {
    "description": record[1],
    "state": record[2]
  }
}

module.exports.build_option_codes = data;

csv_data = fs.readFileSync("./csv_codes/error_codes_en_US.csv", {
  encoding: "ascii"
});

records = parse(csv_data);
// strip out first header row
records.shift();

data = {};
for (let record of records) {
  data[record[0]] = {
    "message": record[1],
    "description": record[2]
  }
}

module.exports.error_codes = data;

csv_data = fs.readFileSync("./csv_codes/setting_codes_en_US.csv", {
  encoding: "ascii"
});

records = parse(csv_data);
// strip out first header row
records.shift();  

data = {};
for (let record of records) {
  data[record[0]] = {
    "setting": record[1],
    "units": record[2],
    "description": record[3]
  }
}

module.exports.setting_codes = data;