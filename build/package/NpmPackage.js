'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var pathTool = require('path');
var util = require('../util');
var fs = require('fs');
var semver = require('semver');
var Package = require('./index');

var NpmPackage = function (_Package) {
  _inherits(NpmPackage, _Package);

  function NpmPackage(meta, handler) {
    _classCallCheck(this, NpmPackage);

    var _this = _possibleConstructorReturn(this, (NpmPackage.__proto__ || Object.getPrototypeOf(NpmPackage)).call(this, 'npm', meta, handler));

    var _meta$split = meta.split('.'),
        _meta$split2 = _slicedToArray(_meta$split, 2),
        packageNameAndVersion = _meta$split2[0],
        bin = _meta$split2[1];

    var _packageNameAndVersio = packageNameAndVersion.split('@'),
        _packageNameAndVersio2 = _slicedToArray(_packageNameAndVersio, 2),
        packageName = _packageNameAndVersio2[0],
        requiredVersion = _packageNameAndVersio2[1];

    _this.name = packageName;
    _this.requiredVersion = requiredVersion || '';
    _this.binName = bin || packageName;
    _this.remote = true;
    _this.updateCheck = true;
    _this.path = pathTool.join(util.modulePath(), packageName);
    return _this;
  }

  _createClass(NpmPackage, [{
    key: 'resolve',
    value: function resolve() {
      if (fs.existsSync(this.path)) {
        var _findBinPath = this.findBinPath(this.path, this.binName),
            _findBinPath2 = _slicedToArray(_findBinPath, 2),
            binPath = _findBinPath2[0],
            packageJson = _findBinPath2[1];

        if (binPath) {
          if (!this.requiredVersion || this.requiredVersion === '*' || semver.satisfies(packageJson.version, this.requiredVersion)) {
            this.binPath = binPath;
            // this.packageJson = packageJson
            this.version = packageJson.version;
            this.newVersion = packageJson.newVersion;
            if (semver.lte(packageJson.newVersion || '0.0.0', packageJson.version)) {
              this.need = false;
            } else {
              this.need = 'update';
            }
          } else {
            this.need = 'install';
          }
        } else throw new Error('can not find executable files[' + this.binName + '] in module [' + this.name + ']');
      } else {
        if (this.resolvePath) {
          throw new Error('resolve path error:' + this.path);
        }
        this.need = 'install';
      }
    }
  }, {
    key: 'findBinPath',
    value: function findBinPath(path, bin) {
      var packageJson = JSON.parse(fs.readFileSync(pathTool.join(path, 'package.json')));
      var binPath = void 0;
      if (typeof packageJson.bin === 'string') {
        packageJson.bin = _defineProperty({}, packageJson.name, packageJson.bin);
      }
      if (packageJson.bin[bin]) {
        binPath = pathTool.join(path, packageJson.bin[bin]);
      } else {
        var defaultPath = pathTool.dirname(packageJson.bin[packageJson.name]);
        var files = fs.readdirSync(pathTool.join(path, defaultPath));
        files = files.filter(function (f) {
          return pathTool.basename(f, pathTool.extname(f)) === packageJson.name + '-' + bin;
        });
        if (files[0]) {
          packageJson.bin[bin] = pathTool.join(defaultPath, files[0]);
          fs.writeFileSync(pathTool.join(path, 'package.json'), JSON.stringify(packageJson, null, 4));
          binPath = pathTool.join(path, defaultPath, files[0]);
        } else {
          return [];
        }
      }
      return [binPath, packageJson];
    }
  }]);

  return NpmPackage;
}(Package);

module.exports = NpmPackage;