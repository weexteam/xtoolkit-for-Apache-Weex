const request = require('request');
const dns = require('dns');
const os = require('os');
const config = require('./config');
let shouldBeTelemetry = false;

exports.record = function (logkey, gokey) {
  if (!shouldBeTelemetry) {
    return;
  }
  const defaultOptions = {
    os: os.platform(),
    node: config.get('node').version,
    npm: config.get('npm').version,
    version: config.get('weex')
  };
  gokey = Object.assign(defaultOptions, gokey);
  let url = 'http://gm.mmstat.com' + logkey + '?';
  for (const i in gokey) {
    if (gokey.hasOwnProperty(i)) {
      url += i + '=' + gokey[i] + '&';
    }
  }
  url += 't=' + new Date().getTime();
  dns.resolve('gm.mmstat.com', function (err) {
    if (!err) {
      request.get(url);
    }
  });
};

exports.allowTarck = function () {
  shouldBeTelemetry = true;
};