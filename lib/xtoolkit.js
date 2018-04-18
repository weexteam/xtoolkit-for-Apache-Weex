const fs = require('fs');
const Command = require('./Command');
const Argv = require('./Argv');
const chalk = require('chalk');
const config = require('./util/config');
const installer = require('./installer');
const path = require('path');
const logger = require('./util/logger');
const utils = require('./util');
const ask = require('./util/ask');
const shell = require('shelljs');

class XToolkit {
  constructor() {
    this.begin = false;
    this._commands = {};
    this.configCommandName = 'config';
    this.updateCommandName = 'update';
    this.removeCommandName = 'remove';
    this.bindCommandName = 'xbind';
  }

  usage(func) {
    this._usage = func;
  }

  _bindCommand(name, info, args) {
    const commands = JSON.parse(config.get('commands', '[]'));
    let replace = false;
    if (info.indexOf(':') === -1) {
      info = 'npm:' + info;
    }
    for (const key in commands) {
      if (commands[key].name === name) {
        commands[key]['package'] = info;
        commands[key]['args'] = args;
        replace = true;
        break;
      }
    }
    if (!replace) {
      commands.push({ name, package: info, args });
    }
    config.set('commands', JSON.stringify(commands));
    config.save();
  }

  _updateCommand(nameAndVersion) {
    let find = false;
    const [name, version] = nameAndVersion.split('@');
    for (const key in this._commands) {
      if (this._commands.hasOwnProperty(key)) {
        const command = this._commands[key];
        if (command.package && command.package.remote && command.package.name === name) {
          find = command;
          break;
        }
      }
    }
    if (find) {
      if (version) find.package.requiredVersion = version;
      installer.update(find.package);
    } else {
      throw new Error('no command found depend on package "' + name + '"');
    }
  }

  _configCommand(name, value) {
    if (name) {
      config.set(name, value);
      config.save();
    } else {
      config.display();
    }
  }

  _removeCommand(nameOrAlias) {
    const commands = JSON.parse(config.get('commands', '[]'));
    let packageName = '';
    let packagePath = '';
    for (let i = 0; i < commands.length; i++) {
      if (commands[i].name === nameOrAlias) {
        packageName = commands[i]['package'].replace('npm:', '');
        commands.splice(i, 1);
        break;
      }
    }
    if (packageName) {
      config.set('commands', JSON.stringify(commands));
      config.save();
    }
    for (const key in this._commands) {
      const command = this._commands[key];
      if (key === nameOrAlias || command.package.name === nameOrAlias) {
        packagePath = command.package.path;
        packageName = command.package.name;
        break;
      }
    }
    if (packageName || packagePath) {
      if (!packagePath) {
        packagePath = path.join(utils.homePath(), 'node_modules', packageName);
      }
      if (fs.existsSync(packagePath)) {
        try {
          shell.rm('-rf', packagePath);
          logger.success(`Remove package \`${packageName}\` successful...`);
        } catch (e) {
          logger.error(e);
        }
      }
    } else {
      logger.error(`Cannot found the \`${nameOrAlias}\` as alias or package name, please check`);
    }
  }

  version(ver) {
    if (typeof ver !== 'function') {
      this._version = function () {
        logger.log('   v' + ver);
      };
    } else {
      this._version = ver;
    }
  }

  command(command, location, args, description) {
    if (!this.begin) {
      this.begin = true;
      process.nextTick(() => {
        this._done();
      });
    }
    this.currentCommand = this._commands[command] = new Command(command, location, args, description);
    return this;
  }

  locate(resolvePath) {
    if (this.currentCommand) {
      this.currentCommand.locate(resolvePath);
    } else {
      logger.error('Resolve(...) must after a command(...)');
    }
  }

  showSubVersion() {
    const map = {};
    for (const key in this._commands) {
      if (this._commands.hasOwnProperty(key)) {
        const command = this._commands[key];
        if (command.package.remote && !map[command.package.name]) {
          map[command.package.name] = true;
          if (fs.existsSync(command.package.path)) {
            const version = JSON.parse(fs.readFileSync(path.join(command.package.path, 'package.json')).toString()).version;
            logger.log(chalk.gray(' - ' + command.package.name + ' : v' + version));
          }
        }
      }
    }
    logger.log('');
  }

  _resolveInternalCommand() {
    // Add internal command
    this.command(this.configCommandName, this._configCommand.bind(this));
    this.command(this.updateCommandName, this._updateCommand.bind(this));
    this.command(this.removeCommandName, this._removeCommand.bind(this));
    this.command(this.bindCommandName, this._bindCommand.bind(this));
  }

  _resolveBindCommand() {
    const commands = JSON.parse(config.get('commands', '[]'));
    commands.forEach(cmd => {
      this._commands[cmd.name] = new Command(cmd.name, cmd.package, cmd.args);
    });
  }
  _runCmd(cmd, argv) {
    if (this._commands[cmd]) {
      this._commands[cmd].run();
    }
    if ((argv.version || argv.v) && this._version) {
      this._version();
      this.showSubVersion();
    }
  }
  _done() {
    this._resolveInternalCommand();
    this._resolveBindCommand();
    const argv = new Argv(process.argv.slice(2));
    const cmd = argv._params[0];
    if (typeof config.get('telemetry') === 'undefined') {
      ask().then(() => {
        this._runCmd(cmd, argv);
      });
    } else {
      this._runCmd(cmd, argv);
    }
  }
}

module.exports = new XToolkit();