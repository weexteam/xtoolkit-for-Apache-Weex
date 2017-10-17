const spawn = require('child_process').spawn;
const semver = require('semver');
const fs = require('fs');
const pathTool = require('path');
const config = require('../util/config');
const name = process.argv[2];
const path = process.argv[3];
const registry = config.get('registry');
let packageJson;
let latestVersion;
const args = ['show', name, 'version'];

if (registry && registry.indexOf('http') === 0) {
  args.push('--registry=' + registry);
}

const npm = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', args);
fs.readFile(pathTool.join(path, 'package.json'), function (err, data) {
  if (!err) {
    packageJson = JSON.parse(data);
    done();
  }
});
function kill () {
  if (npm.stdout) { npm.stdout.destroy(); }

  if (npm.stderr) { npm.stderr.destroy(); }

  try {
    npm.kill('SIGTERM');
  }
  catch (e) {

  }
}
const timer = setTimeout(kill, 15000);
npm.stdout.on('data', (data) => {
  latestVersion = data.toString().trim();
  clearTimeout(timer);
  done();
});
function done () {
  if (latestVersion && packageJson && semver.gt(latestVersion, packageJson.version)) {
    packageJson.newVersion = latestVersion;
    console.log(latestVersion);
    fs.writeFile(pathTool.join(path, 'package.json'), JSON.stringify(packageJson, null, 4), function () {
    });
  }
}
