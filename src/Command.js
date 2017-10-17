const childProcess = require('child_process');
const Transform = require('stream').Transform;
const Argv = require('./Argv');
const pathTool = require('path');
const Package = require('./package');
const installer = require('./installer');
class Command {
  constructor (command, packageInfo, args = [], description) {
    this.command = command;
    if (typeof packageInfo === 'string') {
      const [schema, meta] = packageInfo.split(':');
      this.package = Package.getInstance(schema, meta);
    }
    else if (typeof packageInfo === 'function') {
      this.package = Package.getInstance('local', '', packageInfo);
    }
    else {
      throw new Error('the second argument of Command must be a string or function');
    }
    if (typeof args === 'string') {
      args = args.split(' ');
    }
    this.argv = new Argv(args);

    this.description = description;
  }
  locate (resolvePath) {
    if (this.package.remote) {
      const name = this.package.name;
      this.package.path = resolvePath.slice(0, resolvePath.lastIndexOf(name) + name.length);
      this.package.resolvePath = true;
    }
    else {
      console.error('can not set resolve path on local package');
    }
  }
  run () {
    const pkg = this.package;
    pkg.resolve();
    if (pkg.remote && pkg.need) {
      installer[pkg.need](pkg).then((ignore) => {
        if (!ignore) {
          pkg.resolve();
          if (pkg.remote && pkg.need) {
            throw new Error('fatal error!');
          }
        }
        this._invoke();
      }).catch((e) => {
        console.error(e);
      });
    }
    else { this._invoke(); }
  }

  _invoke () {
    this.resolveProcessArgv();
    const argv = new Argv(process.argv);

    if (this.package.handler) {
      this.package.handler.apply({ command: this, options: argv }, argv._params.slice(2));
    }
    if (this.package.updateCheck)installer.checkNewVersion(this.package);
    if (this.package.binPath) {
      if (argv.help) {
        this.spawnStart(this.package);
      }
      else {
        this.immediateStart(this.package);
      }
    }
  }

  resolveProcessArgv () {
    let idx = 2;
    let remove = 0;
    if (this.command) {
      idx = process.argv.indexOf(this.command);
      process.argv[1] = process.argv[1] + ' ' + this.command;
      remove = 1;
    }

    process.argv.splice.apply(process.argv, [idx, remove].concat(this.argv._params));
    process.argv = process.argv.concat(this.argv._options.map(e => e.text));
  }

  immediateStart (packageInfo) {
    require(packageInfo.binPath);
  }

  spawnStart (packageInfo) {
    let child;
    if (/\.js$/.test(packageInfo.binPath)) {
      child = childProcess.spawn('node', [packageInfo.binPath].concat(process.argv.slice(2)));
    }
    else {
      child = childProcess.spawn(packageInfo.binPath, process.argv.slice(2), {});
    }
    child.stderr.pipe(process.stderr);
    if (packageInfo.schema === 'npm') {
      const depCmd = pathTool.basename(packageInfo.binPath, pathTool.extname(packageInfo.binPath));
      const thisCmd = pathTool.basename(process.argv[1], pathTool.extname(process.argv[1])) + ' ' + this.command;
      const handler = new Transform();
      handler._transform = function (chunk, enc, callback) {
        const newChunk = chunk.toString().replace(new RegExp(depCmd, 'g'), thisCmd);
        this.push(newChunk);
        callback();
      };
      child.stdout.pipe(handler).pipe(process.stdout);
    }
    else {
      child.stdout.pipe(process.stdout);
    }
  }
}
module.exports = Command;
