const request = require('request-promise');
const dns = require('dns');
const os = require('os');
const utf8 = require('utf8');
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
      request({
        method: 'GET',
        uri: 'http://httpbin.org/ip'
      }).then(remote => {
        remote = JSON.parse(remote);
        request({
          method: 'GET',
          uri: `http://ip.taobao.com/service/getIpInfo2.php?ip=${remote.origin}`
        }).then(body => {
          // Request succeeded but might as well be a 404
          // Usually combined with resolveWithFullResponse = true to check response.statusCode
          body = JSON.parse(body);
          goldkey['ip'] = remote.origin;
          goldkey['country'] = utf8.encode(body.data.country);
          goldkey['region'] = utf8.encode(body.data.region);
          goldkey['city'] = utf8.encode(body.data.city);
          goldkey['county'] = utf8.encode(body.data.county);
          goldkey['isp'] = utf8.encode(body.data.isp);
          goldkey['_g_encode'] = 'utf-8';
          let url = `http://gm.mmstat.com${logkey}?`;
          for (const i in goldkey) {
            if (goldkey.hasOwnProperty(i)) {
              url += `${i}=${goldkey[i]}&`;
            }
          }
          url += `t=${new Date().getTime()}`;
          request({
            method: 'GET',
            uri: url
          }).then(() => {}).catch(function (err) {
            // Request failed due to technical reasons...
            request({
              method: 'GET',
              uri: `http://gm.mmstat.com/weex_tool.weex-toolkit.error_track?error=${err}&stack=${err && err.stack}`
            }).then(() => {});
          });
        }).catch(function (err) {
          // Request failed due to technical reasons...
          request({
            method: 'GET',
            uri: `http://gm.mmstat.com/weex_tool.weex-toolkit.error_track?error=${err}&stack=${err && err.stack}`
          }).then(() => {});
        });
      }).catch(function (err) {
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