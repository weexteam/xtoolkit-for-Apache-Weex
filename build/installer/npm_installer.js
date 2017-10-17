'use strict';

var util = require('../util');
var path = require('path');
exports.install = exports.update = function (pkg) {
  var idx = pkg.path.lastIndexOf('node_modules');
  var cwd = void 0;
  if (idx >= 0) {
    cwd = pkg.path.slice(0, idx);
  } else {
    cwd = path.join(pkg.path, '..');
  }
  util.npmInstall(pkg.name + (pkg.requiredVersion ? '@' + pkg.requiredVersion : pkg.requiredVersion ? '@' + pkg.requiredVersion : ''), cwd);
};