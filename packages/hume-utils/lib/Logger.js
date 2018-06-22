/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const pino = require('pino');

let pretty;

if (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') {
  pretty = pino.pretty();
  pretty.pipe(process.stdout);
}


class Logger {
  constructor(name) {
    if (!name) throw new Error('A name is mandatory');

    this.name = name;
    this.log = pino({
      name: this.name,
      safe: true,
    }, pretty);

    this.log.level = 'info';

    if (process.env.DBG && process.env.DBG === 'true') {
      this.log.level = 'debug';
    }
  }

  // We only use these 3 to KISS.
  info(...args) {
    this.log.info(args);
  }
  error(...args) {
    this.log.error(args);
  }
  debug(...args) {
    this.log.debug(args);
  }
}

module.exports = Logger;
