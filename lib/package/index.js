const minimist = require('minimist');
const spawn = require('cross-spawn');
const argv = minimist(process.argv.slice(2));
const packageManager = argv['package-manager'];
let userHasYarn;

class Package {
  constructor(schema, meta, handler) {
    this.defaultType = schema;
    this.schema = this.packageManagerCmd();
    this.meta = meta;
    this.handler = handler;
  }

  static getInstance(schema, meta, handler) {
    let PackageImplement;
    try {
      PackageImplement = require('./' + getClassName(schema));
    } catch (e) {
      throw new Error('can not find package schema: ' + schema);
    }
    return new PackageImplement(meta, handler);
  }
  checkUserHasYarn() {
    if (typeof userHasYarn === 'boolean') {
      return userHasYarn;
    }
    try {
      const result = spawn.sync('yarnpkg', ['--version'], { stdio: 'ignore' });
      if (result.error || result.status !== 0) {
        userHasYarn = false;
      }
      userHasYarn = true;
    } catch (e) {
      userHasYarn = false;
    }
    return userHasYarn;
  }

  // This decides the 'interface' of the package managing command.
  // Ex: If it guesses the type of package manager as 'yarn',
  //     then it executes '(yarn) add' command instead of '(npm) install'.
  packageManagerType() {
    const supportedTypes = ['yarn', 'npm', 'pnpm'];
    if (packageManager) {
      const index = supportedTypes.indexOf(packageManager);
      return index === -1 ? this.defaultType : supportedTypes[index];
    }
    // return this.checkUserHasYarn() ? 'yarn' : this.defaultType;
    return this.defaultType;
  }

  packageManagerCmd() {
    if (packageManager) {
      return packageManager;
    } else {
      return this.packageManagerType();
    }
  }

  resolve() {
    throw new Error('Package.resolve not implement!');
  }
}
function getClassName(schema) {
  return schema[0].toUpperCase() + schema.slice(1) + 'Package';
}
module.exports = Package;