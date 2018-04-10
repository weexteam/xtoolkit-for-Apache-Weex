const inquirer = require('inquirer');
const chalk = require('chalk');
const boxen = require('boxen');
const spawn = require('child_process').spawn;
const pathTool = require('path');
const logger = require('../util/logger');

exports.install = function (pkg) {
  logger.log(`This command need to install ${chalk.white.bgBlue(pkg.name)}. Installing...`);
  let installer;
  return new Promise((resolve, reject) => {
    try {
      installer = require('./' + pkg.schema + '_installer');
    }
    catch (e) {
      reject('can not find installer for "' + pkg.schema);
    }
    installer.install(pkg);
    resolve();
  });
};

exports.update = function (pkg) {
  let msg;
  if (pkg.newVersion) {
    msg = '\n';
    msg += `Update available ${chalk.grey(pkg.version)} → ${chalk.green(pkg.newVersion)}\n`;
    msg += `Run ${chalk.blue('weex update ' + pkg.name + '@' + pkg.newVersion)} to update\n`;
    if (pkg.newChangeLog && pkg.newChangeLog.messages.length > 0) {
      msg += `\n${chalk.yellow(`CHANGELOG:`)}\n`;
      for (const i in pkg.newChangeLog.messages) {
        msg += `\n${chalk.yellow(`- ${pkg.newChangeLog.messages[i]}`)}`;
      }
      if (pkg.newChangeLog.url) {
        msg += `\n${chalk.grey(`\nMore detail you can see: ${pkg.newChangeLog.url}`)}`;
      }
    }
    logger.log(boxen(msg, {
      padding: 1,
      borderColor: 'yellow',
      margin: 1
    }));
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }
  else {
    msg = 'update package "' + pkg.name + '" now?';
    return inquirer.prompt({
      type: 'confirm',
      message: msg,
      name: 'confirm'
    }).then((answers) => {
      if (answers.confirm) {
        let installer;
        try {
          installer = require('./' + pkg.schema + '_installer');
        }
        catch (e) {
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
    let child;
    if (process.platform === 'win32') {
      child = spawn('start', [pathTool.join(__dirname, 'update_checker.vbs'), pkg.schema, pkg.name, pkg.path], {
        stdio: 'ignore',
        detached: true,
        shell: true
      });
    }
    else {
      child = spawn('node', [pathTool.join(__dirname, pkg.schema + '_update_checker.js'), pkg.name, pkg.path], {
        stdio: [0, 1, 2],
        detached: true
      });
    }
    child.unref();
  }
  catch (e) {
    logger.error(e);
  }
};
