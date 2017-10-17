'use strict';

var util = require('../util');
var config = require('../util/config');
var Ping = require('../util/ping');
util.init();
var taobao = new Ping('registry.npm.taobao.org');
var npm = new Ping('registry.npmjs.org');
var count = 0;
var minMs = Infinity;
var registry = void 0;
function done(url, err, ms) {
  console.log('ping ', url || 'http://registry.npmjs.org', ':', ms || 'timeout');
  if (err) {
    ms = Infinity;
  }
  count++;
  if (ms < minMs) {
    minMs = ms;
    registry = url;
  }
  if (count >= 2) {
    if (registry) {
      config.set('registry', registry);
      config.save();
    }
  }
}
taobao.send(done.bind(null, 'http://registry.npm.taobao.org'));
npm.send(done.bind(null, null));