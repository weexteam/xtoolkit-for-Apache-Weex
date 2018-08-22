const request = require('request-promise');
const machine = require('node-machine-id');
const dns = require('dns');
const os = require('os');
const machineId = machine.machineIdSync();
let shouldBeTelemetry = false;

exports.record = function (logkey, goldkey) {
  if (!shouldBeTelemetry) {
    return;
  }
  const defaultOptions = {
    os: os.platform(),
    node: process.version
  };
  goldkey = Object.assign(defaultOptions, goldkey);
  dns.resolve('gm.mmstat.com', function (err) {
    if (!err) {
      goldkey['cna'] = machineId;
      goldkey['cmd'] = goldkey['cmd'].split(' ').slice(1).join(' ');
      let url = `http://gm.mmstat.com${logkey}?`;
      for (const i in goldkey) {
        if (goldkey.hasOwnProperty(i)) {
          url += `${i}=${goldkey[i]}&`;
        }
      }
      url += `t=${(new Date()).getTime()}`;
      request({
        method: 'GET',
        uri: url
      })
        .then(() => {})
        .catch(function (err) {
          // Request failed due to technical reasons...
          request({
            method: 'GET',
            uri: `http://gm.mmstat.com/weex_tool.weex-toolkit.error_track?error=${err}&stack=${err && err.stack}`
          }).then(() => {});
        });
    }
  });
};

exports.allowTarck = function () {
  shouldBeTelemetry = true;
};
