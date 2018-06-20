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

utils.log = utils.logger('script');

utils.exitError = (msg, err) => {
  let errPrint;

  if (err && err.stdout) {
    errPrint = err.stdout.split('...\n\n');
  }

  if (errPrint) {
    errPrint.shift();
  }

  if (errPrint) {
    utils.log.error(msg, errPrint);
  } else {
    utils.log.error(msg);
  }

  process.exit(1);
};

module.exports = utils;
