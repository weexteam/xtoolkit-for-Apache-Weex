'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var Command = require('./Command');
var Argv = require('./Argv');
var chalk = require('chalk');
var config = require('./util/config');
var installer = require('./installer');
var path = require('path');

var XToolkit = function () {
  function XToolkit() {
    _classCallCheck(this, XToolkit);

    this.begin = false;
    this._commands = {};
    this.configCommandName = 'config';
    this.updateCommandName = 'update';
    this.bindCommandName = 'xbind';
  }

  _createClass(XToolkit, [{
    key: '_usage',
    value: function _usage() {}
  }, {
    key: 'usage',
    value: function usage(func) {
      this._usage = func;
    }
  }, {
    key: 'install',
    value: function install(name) {}
  }, {
    key: '_bindCommand',
    value: function _bindCommand(name, info, args) {
      var commands = JSON.parse(config.get('commands', '[]'));
      if (info.indexOf(':') === -1) {
        info = 'npm:' + info;
      }
      commands.push({ name: name, package: info, args: args });
      config.set('commands', JSON.stringify(commands));
      config.save();
    }
  }, {
    key: '_updateCommand',
    value: function _updateCommand(nameAndVersion) {
      var find = false;

      var _nameAndVersion$split = nameAndVersion.split('@'),
          _nameAndVersion$split2 = _slicedToArray(_nameAndVersion$split, 2),
          name = _nameAndVersion$split2[0],
          version = _nameAndVersion$split2[1];

      for (var key in this._commands) {
        if (this._commands.hasOwnProperty(key)) {
          var command = this._commands[key];
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
  }, {
    key: '_configCommand',
    value: function _configCommand(name, value) {
      if (name) {
        config.set(name, value);
        config.save();
      } else {
        config.display();
        // throw new Error('config name can not be empty')
      }
    }
  }, {
    key: 'version',
    value: function version(ver) {
      if (typeof ver !== 'function') {
        this._version = function () {
          console.log('   v' + ver);
        };
      } else {
        this._version = ver;
      }
    }
  }, {
    key: 'command',
    value: function command(_command, location, args, description) {
      var _this = this;

      if (!this.begin) {
        this.begin = true;
        process.nextTick(function () {
          _this._done();
        });
      }
      this.currentCommand = this._commands[_command] = new Command(_command, location, args, description);
      return this;
    }
  }, {
    key: 'locate',
    value: function locate(resolvePath) {
      if (this.currentCommand) {
        this.currentCommand.locate(resolvePath);
      } else {
        console.error('resolve(...) must after a command(...)');
      }
    }
  }, {
    key: 'showSubVersion',
    value: function showSubVersion() {
      var map = {};
      for (var key in this._commands) {
        if (this._commands.hasOwnProperty(key)) {
          var command = this._commands[key];
          if (command.package.remote && !map[command.package.name]) {
            map[command.package.name] = true;
            if (fs.existsSync(command.package.path)) {
              var version = JSON.parse(fs.readFileSync(path.join(command.package.path, 'package.json')).toString()).version;
              console.log(chalk.gray(' - ' + command.package.name + ' : v' + version));
            }
          }
        }
      }
    }
  }, {
    key: '_resolveInternalCommand',
    value: function _resolveInternalCommand() {
      this.command(this.configCommandName, this._configCommand.bind(this));
      this.command(this.updateCommandName, this._updateCommand.bind(this));
      this.command(this.bindCommandName, this._bindCommand.bind(this));
    }
  }, {
    key: '_resolveBindCommand',
    value: function _resolveBindCommand() {
      var _this2 = this;

      var commands = JSON.parse(config.get('commands', '[]'));
      commands.forEach(function (cmd) {
        _this2._commands[cmd.name] = new Command(cmd.name, cmd.package, cmd.args);
      });
    }
  }, {
    key: '_done',
    value: function _done() {
      this._resolveInternalCommand();
      this._resolveBindCommand();
      var argv = new Argv(process.argv.slice(2));
      var cmd = argv._params[0];
      if (this._commands[cmd]) {
        this._commands[cmd].run();
      } else if (this._commands['']) {
        if ((argv.version || argv.v) && this._version) {
          this._version();
          this.showSubVersion();
        } else {
          this._commands[''].run();
        }
      }
    }
  }]);

  return XToolkit;
}();

module.exports = new XToolkit();