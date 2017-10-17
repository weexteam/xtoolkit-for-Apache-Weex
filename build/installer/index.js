'use strict';

var inquirer = require('inquirer');
var chalk = require('chalk');
var boxen = require('boxen');
var spawn = require('child_process').spawn;
var pathTool = require('path');
exports.install = function (pkg) {
  console.log('This command need to install ' + chalk.white.bgBlue(pkg.name) + '. Installing...');
  var installer = void 0;
  return new Promise(function (resolve, reject) {
    try {
      installer = require('./' + pkg.schema + '_installer');
    } catch (e) {
      reject('can not find installer for "' + pkg.schema);
    }
    installer.install(pkg);
    resolve();
  });
};

exports.update = function (pkg) {
  var msg = void 0;
  if (pkg.newVersion) {
    msg = '\n';
    msg += 'Update available ' + chalk.grey(pkg.version) + ' \u2192 ' + chalk.green(pkg.newVersion) + '\n';
    msg += 'Run ' + chalk.blue('weex update ' + pkg.name + '@' + pkg.newVersion) + ' to update\n';
    console.log(boxen(msg, {
      padding: 1,
      borderColor: 'yellow',
      margin: 1
    }));
    return new Promise(function (resolve, reject) {
      resolve(true);
    });
  } else {
    msg = 'update package "' + pkg.name + '" now?';
    return inquirer.prompt({
      type: 'confirm',
      message: msg,
      name: 'confirm'
    }).then(function (answers) {
      if (answers.confirm) {
        var installer = void 0;
        try {
          installer = require('./' + pkg.schema + '_installer');
        } catch (e) {
          throw new Error('can not find installer for "' + pkg.schema);
        }
        installer.update(pkg);
        return false;
      }
      return true;
    });
  }
};
exports.checkNewVersion = function (pkg) {
  try {
    var child = void 0;
    if (process.platform === 'win32') {
      child = spawn('start', [pathTool.join(__dirname, 'update_checker.vbs'), pkg.schema, pkg.name, pkg.path], {
        stdio: 'ignore',
        detached: true,
        shell: true
      });
    } else {
      child = spawn('node', [pathTool.join(__dirname, pkg.schema + '_update_checker.js'), pkg.name, pkg.path], {
        stdio: 'ignore',
        detached: true
      });
    }
    child.unref();
  } catch (e) {
    console.error(e);
  }
};