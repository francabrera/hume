'use strict';

const child = require('child_process');

const utils = require('./utils');

module.exports.env = name => {
  utils.log.info(`Getting values from Bluemix: ${name}`);

  // Sync stuff is fine here because this is an independent string.
  // TODO: Change to promise when supported natively (soon).
  let out;
  try {
    out = child.execSync(`bx app env ${name}`, { encoding: 'utf8' });
  } catch (err) {
    utils.exitError('Running the bx client', err);
  }

  utils.log.debug('bx run finished', { out });

  if (!out) {
    utils.exitError('Empty command output');
  }

  const splitted = out.split('\n\n');

  let vcap = splitted[2];
  let userDefined = splitted[4];

  if (!vcap || !userDefined) {
    utils.exitError('Problem parsing');
  }

  utils.log.debug('Splitted', { vcap, userDefined });

  // Dropping "System-Provided:\n" to get a JSON (still in string).
  vcap = vcap.substring(vcap.indexOf('\n') + 1);
  userDefined = userDefined.split('\n');

  if (!vcap) {
    utils.exitError('Problem parsing vcap');
  }
  if (!userDefined || !userDefined[1]) {
    utils.exitError('Problem parsing userDefined');
  }

  // Dropping 'User-Provided'.
  userDefined.shift();

  utils.log.debug('Splitted again', { vcap, userDefined });

  if (!userDefined || !utils.isArray(userDefined)) {
    utils.exitError('Problem in the last userDefined parsing');
  }

  try {
    vcap = JSON.parse(vcap);
  } catch (err) {
    utils.exitError('Problem parsing the VCAP JSON');
  }

  utils.log.debug('VCAP_SERVICES correctly parsed, setting it', vcap);
  process.env.VCAP_SERVICES = vcap.VCAP_SERVICES;

  try {
    utils.each(userDefined, userVar => {
      utils.log.debug('Var discovered', userVar);

      const splittedVar = userVar.split(':');
      const varName = splittedVar.shift();
      const varValue = JSON.parse(splittedVar.join(':'));

      utils.log.debug('Var parsed, setting it', { varName, varValue });
      process.env[varName] = varValue;
    });
  } catch (err) {
    utils.exitError('Problem parsing the userDefined JSON');
  }

  utils.log.debug('Both parsed to JSON and set');
  utils.log.info('Starting the app with the environment of the Bluemix app', {
    name,
    vcap,
    userDefined,
  });
};
