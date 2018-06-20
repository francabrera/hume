/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const utils = require('@hume/utils');
const monit = require('@hume/monit-express');

const { name } = require('../../package.json');

const log = utils.logger(name);

utils.log = log;

// To set the env var is the way we use to enable it.
if (process.env.DB_ELASTIC) {
  utils.monit = monit;
}

utils.error = async (msg, error, opts) => {
  if (process.env.DB_ELASTIC) {
    try {
      await monit.error(msg, error, opts);
      log.debug('Error properly reported to monit', error);
    } catch (err) {
      log.error('monit reporting error: ', err);
    }
  }

  log.error(msg, error);
};

module.exports = utils;
