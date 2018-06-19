#!/usr/bin/env node

'use strict';

const path = require('path');

// eslint-disable-next-line import/no-extraneous-dependencies
const program = require('commander');

const utils = require('./lib/utils');
const bx = require('./lib/bluemix');
const { version } = require('./package.json');

const log = utils.logger('script:run');
let command;

program
  .version(version)
  .description(
    'Some useful development tasks to run things locally but with a' +
      ' bluemix app environment variables. Only one options is' +
      'supported at the same time.',
  )
  .usage('[options] <app>')
  // in an  with a bluemix app environment variables
  .option(
    '-s, --start <path>',
    'Start a local app with Bluemix environment variables, ie: ./server.js',
  )
  .option('-p, --populate', 'Database population ready for production.')
  .parse(process.argv);

log.debug('Started', { args: program.args });

if (!program.args || !program.args[0]) {
  utils.exitError('The "app" param is mandatory');
}

const [name] = program.args;

if (typeof name !== 'string') {
  utils.exitError('"app" should be a string');
}

log.info('Setting the env for the app', { name });
bx.env(name);

if (program.start) {
  if (typeof program.start !== 'string') {
    utils.exitError('"service" should be a string)');
  }

  log.info('Start option passed');

  command = path.resolve(process.cwd(), program.start);
} else if (program.populate) {
  log.info('DB populate passed');

  log.info('TODO: Still not implemented ...');

  // command = './populate';
}

if (command) {
  log.info('Running the script ...');
  // eslint-disable-next-line global-require,import/no-dynamic-require
  require(command);
} else {
  log.info('No script to run, exiting ...');
}
