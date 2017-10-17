'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Argv = function () {
  function Argv(args, def) {
    _classCallCheck(this, Argv);

    this._def = def;
    this._options = [];
    this._params = [];
    this.options = {};
    var reg = /^-{1,2}/;
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      if (reg.test(arg)) {
        this._completePrevOption(true);

        var _arg$replace$split = arg.replace(reg, '').split('='),
            _arg$replace$split2 = _slicedToArray(_arg$replace$split, 2),
            name = _arg$replace$split2[0],
            value = _arg$replace$split2[1];

        this._addOption(name, arg, value);
      } else {
        if (!this._completePrevOption(arg)) {
          this._params.push(arg);
        }
      }
    }
    this._completePrevOption(true);
    var options = this.options;
    delete this.options;
    Object.setPrototypeOf(options, this);
    return options;
  }

  _createClass(Argv, [{
    key: '_hasPrevOption',
    value: function _hasPrevOption() {
      return this._options.length > 0 && this._options[this._options.length - 1].value === undefined;
    }
  }, {
    key: '_completePrevOption',
    value: function _completePrevOption(value) {
      if (this._hasPrevOption()) {
        var option = this._options[this._options.length - 1];
        option.value = value;
        this.options[option.name] = value;
        return true;
      }
      return false;
    }
  }, {
    key: '_addOption',
    value: function _addOption(name, text, value) {
      var known = false;
      if (this._def && this._def[name]) {
        known = true;
        if (this._def[name].type === 'boolean') {
          value = true;
        }
      }
      this._options.push({ name: name, value: value, text: text, known: known });
      this.options[name] = value;
    }
  }, {
    key: 'dump',
    value: function dump() {
      console.log(this._options, this._params);
    }
  }]);

  return Argv;
}();

module.exports = Argv;