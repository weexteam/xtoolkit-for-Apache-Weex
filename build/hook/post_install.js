const util = require('../util');
const config = require('../util/config');
const inquirer = require('inquirer');
const logger = require('../util/logger');

const taobao = `http://registry.npm.taobao.org`;
const npm = `http://registry.npmjs.org`;

util.init();

function showPrompt() {
  const questions = [{
    name: 'telemetry',
    type: 'confirm',
    message: 'May weex-toolkit anonymously report usage statistics to improve the tool over time?'
  }, {
    name: 'registry',
    type: 'list',
    choices: [{ name: 'use npm', value: 'npm', short: 'npm' }, { name: 'use taobao (for Chinese)', value: 'taobao', short: 'taobao' }],
    message: 'Which npm registry you perfer to use?'
  }];
  return inquirer.prompt(questions).then(answers => {
    logger.info(`Set telemetry => ${answers.telemetry}`);
    logger.info(`Set registry => ${answers.registry === 'npm' ? npm : taobao}`);
    config.set('telemetry', answers.telemetry);
    config.set('registry', answers.registry === 'npm' ? npm : taobao);
    config.save();
  });
}

showPrompt().then(() => {
  logger.info(`You can config this configuration again by using \`weex config [key] [value]\``);
  logger.success(`Enjoying your coding time!`);
});