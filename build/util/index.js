'use strict';

var childProcess = require('child_process');
var fs = require('fs');
var pathTool = require('path');
var chalk = require('chalk');

exports.npmInstall = function (name, cwd) {
  this.init();
  var config = require('./config');
  var args = ['install', name, '--loglevel=error'];
  if (config.get('registry')) {
    args.push('--registry=' + config.get('registry'));
  }
  var result = childProcess.spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
    stdio: ['inherit', 'ignore', 'inherit'],
    cwd: cwd
  });
  return result;
};
exports.homePath = function () {
  var home = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
  return pathTool.join(home, '.xtoolkit');
};

exports.modulePath = function () {
  return pathTool.join(this.homePath(), 'node_modules');
};
exports.init = function () {
  var nodeModulePath = this.modulePath();
  if (!fs.existsSync(this.homePath())) {
    try {
      fs.mkdirSync(this.homePath());
      fs.mkdirSync(nodeModulePath);
    } catch (e) {
      process.stderr.write(chalk.red('\ninit toolkit directory error!\n'));
      process.stderr.write(chalk.green('we suggest you run "sudo chmod 777 ~" and re install'));
      process.stderr.write(chalk.green('or you can try "mkdir ~/.xtoolkit&&chmod 777 .xtoolkit"\n'));
      throw e;
    }
  } else if (!fs.existsSync(nodeModulePath)) {
    fs.mkdirSync(nodeModulePath);
  }
  return nodeModulePath;
};