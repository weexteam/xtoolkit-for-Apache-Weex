const util = require('./index');
const fs = require('fs');
const pathTool = require('path');
const mkdirp = require('mkdirp');
const logger = require('./logger');

let _config;
try {
  _config = require(pathTool.join(util.homePath(), 'config.json'));
} catch (e) {
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
  if (typeof cur !== 'undefined') {
    if (cur === 'true') {
      return true;
    } else if (cur === 'false') {
      return false;
    }
  }
  return cur || (typeof cur === 'boolean' ? cur : defaultValue);
};
exports.set = function (prop, value) {
  const props = prop.split('.');
  let p = props.shift();
  let cur = _config;
  if (!value) {
    if (typeof _config[prop] === 'string') {
      logger.log(`${prop} = "${_config[prop]}"`);
    } else {
      logger.log(`${prop} = ${_config[prop]}`);
    }
    return;
  }
  if (typeof value === 'string' && value === 'true') {
    value = true;
  } else if (typeof value === 'string' && value === 'false') {
    value = false;
  }
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
  if (typeof value === 'string') {
    logger.log(`Set ${prop} = "${value}"`);
  } else {
    logger.log(`Set ${prop} = ${value}`);
  }
  return value;
};
exports.save = function () {
  const configPath = pathTool.join(util.homePath(), 'config.json');
  if (!fs.existsSync(util.homePath())) {
    mkdirp(util.homePath(), function (err) {
      if (err) {
        logger.error(err);
      }
    });
  }
  if (!fs.existsSync(configPath)) {
    fs.open(configPath, 'w+', '0666', (err, fd) => {
      if (err) {
        logger.error(err);
      }
      fs.writeFileSync(configPath, JSON.stringify(_config, null, 2));
    });
  } else {
    fs.writeFileSync(configPath, JSON.stringify(_config, null, 2));
  }
};

exports.display = function () {
  for (const key in _config) {
    if (_config.hasOwnProperty(key)) {
      if (typeof _config[key] === 'string') {
        logger.log(`${key} = "${_config[key]}"`);
      } else {
        logger.log(`${key} = ${_config[key]}`);
      }
    }
  }
};