const util = require('./index');
const fs = require('fs');
const pathTool = require('path');
let _config;
try {
  _config = require(pathTool.join(util.homePath(), 'config.json'));
}
catch (e) {
  _config = {};
}
exports.get = function (prop, defaultValue) {
  const props = prop.split('.');
  let p = props.shift();
  let cur = _config;
  while (p) {
    cur = cur[p];
    if (cur === undefined || cur === null) break;
    p = props.shift();
  }
  return cur || defaultValue;
};
exports.set = function (prop, value) {
  const props = prop.split('.');
  let p = props.shift();
  let cur = _config;
  while (p) {
    if (props.length === 0) {
      if (value !== undefined) { cur[p] = value; }
      else delete cur[p];
    }
    else {
      if (cur[p] === undefined || cur[p] === null) {
        if (value === undefined) break;
        cur[p] = {};
      }
      cur = cur[p];
    }
    p = props.shift();
  }
  return value;
};
exports.save = function () {
  fs.writeFileSync(pathTool.join(util.homePath(), 'config.json'), JSON.stringify(_config, null, 4));
};
exports.display = function () {
  for (const key in _config) {
    if (_config.hasOwnProperty(key)) {
      console.log(key, '=', _config[key]);
    }
  }
};
