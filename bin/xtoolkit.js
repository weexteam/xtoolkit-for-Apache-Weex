#!/usr/bin/env node
'use strict';

var program = require('commander');
var util = require('../build/util');
var fs = require('fs');
var pathTool = require('path');
program.command('install <name>').action(function (name) {
  util.init();
  if (!fs.existsSync(pathTool.join(util.modulePath(), name.split('@')[0]))) {
    util.npmInstall(name, util.homePath(), true);
  }
});
program.parse(process.argv);