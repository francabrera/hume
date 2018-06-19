/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const utils = require('./lib/utils');
const { version } = require('../package.json');

const env = process.env.NODE_ENV || 'development';

module.exports = {
  port: utils.appEnv.port,
  isDevEnv: env === 'development' || env === 'test',
  restApiVersion: version,
  restApiRoot: `/api/v${version.split('.').shift()}`,
};
