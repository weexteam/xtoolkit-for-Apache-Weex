const pathTool = require('path');
const util = require('../util');
const fs = require('fs');
const semver = require('semver');
const Package = require('./index');
class NpmPackage extends Package {
  constructor (meta, handler) {
    super('npm', meta, handler);
    const [packageNameAndVersion, bin] = meta.split('.');
    const [packageName, requiredVersion] = packageNameAndVersion.split('@');
    this.name = packageName;
    this.requiredVersion = requiredVersion || '';
    this.binName = bin || packageName;
    this.remote = true;
    this.updateCheck = true;
    this.path = pathTool.join(util.modulePath(), packageName);
  }

  resolve () {
    if (fs.existsSync(this.path)) {
      const [binPath, packageJson] = this.findBinPath(this.path, this.binName);
      if (binPath) {
        if (!this.requiredVersion || this.requiredVersion === '*' || semver.satisfies(packageJson.version, this.requiredVersion)) {
          this.binPath = binPath;
          // this.packageJson = packageJson
          this.version = packageJson.version;
          this.newVersion = packageJson.newVersion;
          if (semver.lte(packageJson.newVersion || '0.0.0', packageJson.version)) { this.need = false; }
          else { this.need = 'update'; }
        }

        else {
          this.need = 'install';
        }
      }
      else throw new Error('can not find executable files[' + this.binName + '] in module [' + this.name + ']');
    }
    else {
      if (this.resolvePath) {
        throw new Error('resolve path error:' + this.path);
      }
      this.need = 'install';
    }
  }

  findBinPath (path, bin) {
    const packageJson = JSON.parse(fs.readFileSync(pathTool.join(path, 'package.json')));
    let binPath;
    if (typeof packageJson.bin === 'string') {
      packageJson.bin = { [packageJson.name]: packageJson.bin };
    }
    if (packageJson.bin[bin]) {
      binPath = pathTool.join(path, packageJson.bin[bin]);
    }
    else {
      const defaultPath = pathTool.dirname(packageJson.bin[packageJson.name]);
      let files = fs.readdirSync(pathTool.join(path, defaultPath));
      files = files.filter(f => pathTool.basename(f, pathTool.extname(f)) === packageJson.name + '-' + bin);
      if (files[0]) {
        packageJson.bin[bin] = pathTool.join(defaultPath, files[0]);
        fs.writeFileSync(pathTool.join(path, 'package.json'), JSON.stringify(packageJson, null, 4));
        binPath = pathTool.join(path, defaultPath, files[0]);
      }
      else {
        return [];
      }
    }
    return [binPath, packageJson];
  }
}
module.exports = NpmPackage;
