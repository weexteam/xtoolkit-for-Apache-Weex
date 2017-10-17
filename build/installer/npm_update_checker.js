'use strict';

var spawn = require('child_process').spawn;
var semver = require('semver');
var fs = require('fs');
var pathTool = require('path');
var config = require('../util/config');
var name = process.argv[2];
var path = process.argv[3];
var registry = config.get('registry');
var packageJson = void 0;
var latestVersion = void 0;
var args = ['show', name, 'version'];

if (registry && registry.indexOf('http') === 0) {
  args.push('--registry=' + registry);
}

var npm = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', args);
fs.readFile(pathTool.join(path, 'package.json'), function (err, data) {
  if (!err) {
    packageJson = JSON.parse(data);
    done();
  }
});
function kill() {
  if (npm.stdout) {
    npm.stdout.destroy();
  }

  if (npm.stderr) {
    npm.stderr.destroy();
  }

  try {
    npm.kill('SIGTERM');
  } catch (e) {}
}
var timer = setTimeout(kill, 15000);
npm.stdout.on('data', function (data) {
  latestVersion = data.toString().trim();
  clearTimeout(timer);
  done();
});
function done() {
  if (latestVersion && packageJson && semver.gt(latestVersion, packageJson.version)) {
    packageJson.newVersion = latestVersion;
    console.log(latestVersion);
    fs.writeFile(pathTool.join(path, 'package.json'), JSON.stringify(packageJson, null, 4), function () {});
  }
}