'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Package = function () {
  function Package(schema, meta, handler) {
    _classCallCheck(this, Package);

    this.schema = schema;
    this.meta = meta;
    this.handler = handler;
  }

  _createClass(Package, [{
    key: 'resolve',
    value: function resolve() {
      throw new Error('Package.resolve not implement!');
    }
  }], [{
    key: 'getInstance',
    value: function getInstance(schema, meta, handler) {
      var PackageImplement = void 0;
      try {
        PackageImplement = require('./' + getClassName(schema));
      } catch (e) {
        throw new Error('can not find package schema: ' + schema);
      }
      return new PackageImplement(meta, handler);
    }
  }]);

  return Package;
}();

function getClassName(schema) {
  return schema[0].toUpperCase() + schema.slice(1) + 'Package';
}

module.exports = Package;