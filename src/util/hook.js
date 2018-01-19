const request = require('request');
const dns = require('dns');
const os = require('os');
let shouldBeTelemetry = false;

exports.record = function (logkey, gokey) {
  if (!shouldBeTelemetry) {
    return;
  }
  const defaultOptions = {
    os: os.platform(),
    node: process.version
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
