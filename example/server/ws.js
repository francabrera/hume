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
const appWs = require('../../packages/hume-app-ws');

const name = 'Demo WS';

const log = utils.logger(name);

log.info('Starting the HTTP app ...');

app.start(__dirname, {
  name,
  noHttp: true,
});

log.info('Starting WS app ...');

async function cache() {
  const all = await app.models.cat.find();
  const result = {};

  // To respect expected cache format.
  utils.each(all, one => {
    result[one.name] = one;
  });

  return result;
}

app.on('bootedAll', () => {
  log.info('hume app booted');
  appWs.start(cache, 'bad_token');
});
