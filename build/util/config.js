'use strict';

var util = require('./index');
var fs = require('fs');
var pathTool = require('path');
var _config = void 0;
try {
  _config = require(pathTool.join(util.homePath(), 'config.json'));
} catch (e) {
  _config = {};
}
exports.get = function (prop, defaultValue) {
  var props = prop.split('.');
  var p = props.shift();
  var cur = _config;
  while (p) {
    cur = cur[p];
    if (cur === undefined || cur === null) break;
    p = props.shift();
  }
  return cur || defaultValue;
};
exports.set = function (prop, value) {
  var props = prop.split('.');
  var p = props.shift();
  var cur = _config;
  while (p) {
    if (props.length === 0) {
      if (value !== undefined) {
        cur[p] = value;
      } else delete cur[p];
    } else {
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
  for (var key in _config) {
    if (_config.hasOwnProperty(key)) {
      console.log(key, '=', _config[key]);
    }
  }
};