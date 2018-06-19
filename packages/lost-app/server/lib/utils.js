'use strict';

const utils = require('@lost/utils');
const jLocke = require('jlocke');

const { name } = require('../../package.json');

const log = utils.logger(name);

utils.log = log;

// To set the env var is the way we use to enable it.
if (process.env.DB_ELASTIC) {
  utils.jLocke = jLocke;
}

utils.error = async (msg, error, opts) => {
  if (process.env.DB_ELASTIC) {
    try {
      await jLocke.error(msg, error, opts);
      log.debug('Error properly reported to jLocke', error);
    } catch (err) {
      log.error('jLocke reporting error: ', err);
    }
  }

  log.error(msg, error);
};

module.exports = utils;
