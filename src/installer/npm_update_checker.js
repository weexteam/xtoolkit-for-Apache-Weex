const spawn = require('cross-spawn');
const semver = require('semver');
const fs = require('fs');
const pathTool = require('path');
const evalExpression = require('../util/eval');
const config = require('../util/config');
const name = process.argv[2];
const path = process.argv[3];
const registry = config.get('registry');
let packageJson;
let latestChangelog;
let latestVersion;

const args = ['info', name];

if (registry && registry.indexOf('http') === 0) {
  args.push('--registry=' + registry);
}
const npm = spawn('npm', args);

const kill = () => {
  if (npm.stdout) { npm.stdout.destroy(); }

  if (npm.stderr) { npm.stderr.destroy(); }

  try {
    npm.kill('SIGTERM');
  }
  catch (e) {

  }
};

const timer = setTimeout(kill, 15000);

fs.readFile(pathTool.join(path, 'package.json'), function (err, data) {
  if (!err) {
    packageJson = JSON.parse(data);
    done();
  }
});

const done = () => {
  if (latestVersion && packageJson && semver.gt(latestVersion, packageJson.version)) {
    packageJson.newVersion = latestVersion;
    if (latestChangelog) {
      packageJson.newChangeLog = latestChangelog;
    }
    fs.writeFile(pathTool.join(path, 'package.json'), JSON.stringify(packageJson, null, 2), function () {
    });
  }
};

npm.stdout.on('data', (data) => {
  const npminfo = evalExpression(data.toString().trim().replace('\n', ''));
  latestVersion = npminfo['dist-tags'].latest;
  latestChangelog = npminfo['changelog'] || [];
  clearTimeout(timer);
  done();
});
