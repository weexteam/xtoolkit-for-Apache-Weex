const request = require('request-promise');
const dns = require('dns');
const os = require('os');
const ip = require('ip').address();
let shouldBeTelemetry = false;

exports.record = function (logkey, goldkey) {
  if (!shouldBeTelemetry) {
    return;
  }
  const defaultOptions = {
    os: os.platform(),
    node: process.version,
    ip: ip
  };
  goldkey = Object.assign(defaultOptions, goldkey);
  dns.resolve('gm.mmstat.com', function (err) {
    if (!err) {
      request({
        method: 'GET',
        uri: `http://ip.taobao.com/service/getIpInfo2.php?ip=${goldkey.ip}`
      }).then(body => {
        // Request succeeded but might as well be a 404
        // Usually combined with resolveWithFullResponse = true to check response.statusCode
        body = JSON.parse(body);
        goldkey['country'] = body.data.country;
        goldkey['region'] = body.data.region;
        goldkey['city'] = body.data.city;
        goldkey['county'] = body.data.county;
        goldkey['isp'] = body.data.isp;
        goldkey['_g_encode'] = 'utf-8';
        let url = `http://gm.mmstat.com${logkey}?`;
        for (const i in goldkey) {
          if (goldkey.hasOwnProperty(i)) {
            url += `${i}=${goldkey[i]}&`;
          }
        }
        request({
          method: 'GET',
          uri: url
        }).then(() => {});
      }).catch(function (err) {
        // Request failed due to technical reasons...
        request({
          method: 'GET',
          uri: `http://gm.mmstat.com/weex_tool.weex_playground.app_update_error?error=${err.stack || err}`
        }).then(() => {});
      });
    }
  });
};

exports.allowTarck = function () {
  shouldBeTelemetry = true;
};