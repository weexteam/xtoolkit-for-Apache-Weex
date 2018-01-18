#!/usr/bin/env node

const program = require('commander');
const util = require('../build/util');
const fs = require('fs');
const pathTool = require('path');
program.command('install <name>').action(function (name) {
  util.init();
  if (!fs.existsSync(pathTool.join(util.modulePath(), name.split('@')[0]))) {
    util.npmInstall(name, util.homePath(), true);
  }
});
program.parse(process.argv);