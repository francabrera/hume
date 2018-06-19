/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const bunyan = require('bunyan');
const PrettyStream = require('bunyan-prettystream');

const prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

class Logger {
  constructor(name) {
    if (!name) throw new Error('A name is mandatory');

    let level = 'info';

    if (process.env.DBG && process.env.DBG === 'true') {
      level = 'debug';
    }

    this.name = name;
    this.log = bunyan.createLogger({
      name,
      streams: [
        {
          level,
          stream: prettyStdOut,
        },
      ],
    });
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
