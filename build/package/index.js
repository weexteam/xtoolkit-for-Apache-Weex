class Package {
  constructor(schema, meta, handler) {
    this.schema = schema;
    this.meta = meta;
    this.handler = handler;
  }

  resolve() {
    throw new Error('Package.resolve not implement!');
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
}
function getClassName(schema) {
  return schema[0].toUpperCase() + schema.slice(1) + 'Package';
}

module.exports = Package;