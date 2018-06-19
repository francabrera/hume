/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const utils = require('../../packages/lost-utils');
const app = require('../../packages/lost-app');
const appWs = require('../../packages/lost-app-ws');

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
  utils.each(all, one => { result[one.name] = one; });

  return result;
}

app.on('bootedAll', () => {
  log.info('lost app booted');
  appWs.start(name, cache, 'bad_token');
});

