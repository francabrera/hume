/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const utils = require('../../packages/hume-utils');
const app = require('../../packages/hume-app');

const name = 'Demo HTTP API';

const log = utils.logger(name);

log.info('Starting the app ...');

app.start(__dirname, {
  name,
  // auth: false,
  explorer: {
    title: 'HTTP API Example',
    description: 'Specification demo.',
  },
  cache: { methods: { cat: ['find'] } },
});

module.exports = app;
