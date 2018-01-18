const logger = require('./util/logger');

class Argv {
  constructor (args, def) {
    this._def = def;
    this._options = [];
    this._params = [];
    this.options = {};
    const reg = /^-{1,2}/;
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (reg.test(arg)) {
        this._completePrevOption(true);
        const [name, value] = arg.replace(reg, '').split('=');
        this._addOption(name, arg, value);
      }
      else {
        if (!this._completePrevOption(arg)) {
          this._params.push(arg);
        }
      }
    }
    this._completePrevOption(true);
    const options = this.options;
    delete this.options;
    Object.setPrototypeOf(options, this);
    return options;
  }

  _hasPrevOption () {
    return this._options.length > 0 && this._options[this._options.length - 1].value === undefined;
  }

  _completePrevOption (value) {
    if (this._hasPrevOption()) {
      const option = this._options[this._options.length - 1];
      option.value = value;
      this.options[option.name] = value;
      return true;
    }
    return false;
  }

  _addOption (name, text, value) {
    let known = false;
    if (this._def && this._def[name]) {
      known = true;
      if (this._def[name].type === 'boolean') {
        value = true;
      }
    }
    this._options.push({ name, value, text, known });
    this.options[name] = value;
  }
  dump () {
    logger.log(this._options, this._params);
  }
}
module.exports = Argv;
