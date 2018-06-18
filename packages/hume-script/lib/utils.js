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
