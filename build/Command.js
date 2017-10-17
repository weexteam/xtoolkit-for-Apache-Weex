'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var childProcess = require('child_process');
var Transform = require('stream').Transform;
var Argv = require('./Argv');
var pathTool = require('path');
var Package = require('./package');
var installer = require('./installer');

var Command = function () {
  function Command(command, packageInfo) {
    var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var description = arguments[3];

    _classCallCheck(this, Command);

    this.command = command;
    if (typeof packageInfo === 'string') {
      var _packageInfo$split = packageInfo.split(':'),
          _packageInfo$split2 = _slicedToArray(_packageInfo$split, 2),
          schema = _packageInfo$split2[0],
          meta = _packageInfo$split2[1];

      this.package = Package.getInstance(schema, meta);
    } else if (typeof packageInfo === 'function') {
      this.package = Package.getInstance('local', '', packageInfo);
    } else {
      throw new Error('the second argument of Command must be a string or function');
    }
    if (typeof args === 'string') {
      args = args.split(' ');
    }
    this.argv = new Argv(args);

    this.description = description;
  }

  _createClass(Command, [{
    key: 'locate',
    value: function locate(resolvePath) {
      if (this.package.remote) {
        var name = this.package.name;
        this.package.path = resolvePath.slice(0, resolvePath.lastIndexOf(name) + name.length);
        this.package.resolvePath = true;
      } else {
        console.error('can not set resolve path on local package');
      }
    }
  }, {
    key: 'run',
    value: function run() {
      var _this = this;

      var pkg = this.package;
      pkg.resolve();
      if (pkg.remote && pkg.need) {
        installer[pkg.need](pkg).then(function (ignore) {
          if (!ignore) {
            pkg.resolve();
            if (pkg.remote && pkg.need) {
              throw new Error('fatal error!');
            }
          }
          _this._invoke();
        }).catch(function (e) {
          console.error(e);
        });
      } else {
        this._invoke();
      }
    }
  }, {
    key: '_invoke',
    value: function _invoke() {
      this.resolveProcessArgv();
      var argv = new Argv(process.argv);

      if (this.package.handler) {
        this.package.handler.apply({ command: this, options: argv }, argv._params.slice(2));
      }
      if (this.package.updateCheck) installer.checkNewVersion(this.package);
      if (this.package.binPath) {
        if (argv.help) {
          this.spawnStart(this.package);
        } else {
          this.immediateStart(this.package);
        }
      }
    }
  }, {
    key: 'resolveProcessArgv',
    value: function resolveProcessArgv() {
      var idx = 2;
      var remove = 0;
      if (this.command) {
        idx = process.argv.indexOf(this.command);
        process.argv[1] = process.argv[1] + ' ' + this.command;
        remove = 1;
      }

      process.argv.splice.apply(process.argv, [idx, remove].concat(this.argv._params));
      process.argv = process.argv.concat(this.argv._options.map(function (e) {
        return e.text;
      }));
    }
  }, {
    key: 'immediateStart',
    value: function immediateStart(packageInfo) {
      require(packageInfo.binPath);
    }
  }, {
    key: 'spawnStart',
    value: function spawnStart(packageInfo) {
      var child = void 0;
      if (/\.js$/.test(packageInfo.binPath)) {
        child = childProcess.spawn('node', [packageInfo.binPath].concat(process.argv.slice(2)));
      } else {
        child = childProcess.spawn(packageInfo.binPath, process.argv.slice(2), {});
      }
      child.stderr.pipe(process.stderr);
      if (packageInfo.schema === 'npm') {
        var depCmd = pathTool.basename(packageInfo.binPath, pathTool.extname(packageInfo.binPath));
        var thisCmd = pathTool.basename(process.argv[1], pathTool.extname(process.argv[1])) + ' ' + this.command;
        var handler = new Transform();
        handler._transform = function (chunk, enc, callback) {
          var newChunk = chunk.toString().replace(new RegExp(depCmd, 'g'), thisCmd);
          this.push(newChunk);
          callback();
        };
        child.stdout.pipe(handler).pipe(process.stdout);
      } else {
        child.stdout.pipe(process.stdout);
      }
    }
  }]);

  return Command;
}();

module.exports = Command;