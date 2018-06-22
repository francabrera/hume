/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const utils = require('../lib/utils');

// A prettier error logging that the LoopBack one.

module.exports = () => (err, req, res, next) => {
  const error = {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    stack: err.stack,
  };

  // TODO: Confirm what we want to log without breaking privacy and keeping thins simple.
  let request;
  if (req) {
    request = {
      path: req.path,
      method: req.method,
      ip: req.ip,
    };
  }

  utils.log.error('HTTP error', { request, error });

  next(err);
};
