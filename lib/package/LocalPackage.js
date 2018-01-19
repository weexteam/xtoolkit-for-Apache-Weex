const pathTool = require('path');
const Package = require('./index');
class LocalPackage extends Package {
  constructor(meta, handler) {
    super('local', meta, handler);
    this.remote = false;
  }

  resolve() {
    if (this.meta) {
      this.binPath = pathTool.join(pathTool.dirname(require.main.filename), this.meta);
    }
  }
}
module.exports = LocalPackage;