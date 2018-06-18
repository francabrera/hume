'use strict';

const utils = require('../lib/utils');

// A prettier error logging that the LoopBack one.

module.exports = (opts = {}) => (err, req, res, next) => {
  if (!opts.enabled || !err) {
    next(err);
    return;
  }

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

  utils.log.info('HTTP error', { request, error });

  next(err);
};
