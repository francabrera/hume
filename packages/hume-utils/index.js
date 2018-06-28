/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const util = require('util');

// Lodash as base.
const utils = require('lodash');
const map = require('p-map');
const mapSeries = require('p-map-series');
const eachSeries = require('p-each-series');

utils.requireDir = require('require-directory');
utils.sleep = require('system-sleep');
utils.validator = require('validator');
utils.appEnv = require('cfenv').getAppEnv();

const { name, version } = require('./package.json');
const Logger = require('./lib/Logger');
const lb = require('./lib/loopback');

const log = new Logger(name);

// Using Math.round() will give you a non-uniform distribution.
utils.randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

utils.version = version;

// We want the name of caller, not this package one.
utils.logger = tag => new Logger(tag || 'app');

utils.lb = lb;

utils.promise = { map, mapSeries, eachSeries };

if (process.env.Q_MICRO && process.env.Q_MICRO === true) {
  log.debug('Local environment detected, tricking the port ...');
  // We should check the port is not bussy with a package like this:
  // https://www.npmjs.com/package/get-port
  // But we only have a bunch of services and we use this for local testing,
  // so it shouldn't be a problem and we prefer to keep it sync (KISS).
  const port = utils.randomInt(1024, 65535);
  utils.appEnv.port = port;
  utils.appEnv.url = utils.appEnv.url.replace(/3000/, port);
}

utils.error = async (msg, error, opts = {}) => {
  if (!msg) {
    throw Error('Required: "msg"');
  }
  log.error(msg, error, opts);

  if (utils.apm && utils.apm.error) {
    const optsCap = { custom: opts.custom || {} };
    let err = error;
    if (!error) {
      err = new Error(msg);
    } else {
      // To avoid lost this info.
      optsCap.custom.message = msg;
    }
    if (opts.userId) {
      optsCap.user.id = opts.userId;
    }

    // https://www.elastic.co/guide/en/apm/agent/nodejs/current/agent-api.html#apm-capture-error
    const captureError = util.promisify(utils.apm.captureError);

    try {
      await captureError(err, optsCap);

      log.debug('Error properly reported to APM', { msg, error: error.message, opts });
    } catch (errR) {
      log.error('APM reporting error: ', errR);
    }
  }
};

module.exports = utils;
