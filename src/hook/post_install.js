const util = require('../util');
const config = require('../util/config');
const Ping = require('../util/ping');
util.init();
const taobao = new Ping('registry.npm.taobao.org');
const npm = new Ping('registry.npmjs.org');
let count = 0;
let minMs = Infinity;
let registry;
function done (url, err, ms) {
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
