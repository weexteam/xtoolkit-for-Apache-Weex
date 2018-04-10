const util = require('../util');
const path = require('path');
exports.install = exports.update = function (pkg) {
  const idx = pkg.path.lastIndexOf('node_modules');
  let cwd;
  if (idx >= 0) {
    cwd = pkg.path.slice(0, idx);
  }
  else {
    cwd = path.join(pkg.path, '..');
  }
  util.yarnInstall(pkg.name + (pkg.requiredVersion ? '@' + pkg.requiredVersion : pkg.requiredVersion ? '@' + pkg.requiredVersion : ''), cwd);
};
