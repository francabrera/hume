/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const utils = require('@lost/utils');

const { name } = require('../package.json');

const log = utils.logger(name);

utils.log = log;


module.exports = utils;
