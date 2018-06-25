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

// This is intended for non-production configurations (specification in pino constructor)
// https://github.com/pinojs/pino/blob/master/docs/API.md#pretty
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
  info(msg, data) {
    this.log.info(data, msg);
  }
  error(msg, err, data) {
    this.log.error(err, msg);
    
    if (data){
      this.log.error(data);
    }
  }
  debug(msg, err, data) {
    this.log.debug(err, msg);

    if(data){
      this.log.debug(data);
    }
  }
}

module.exports = Logger;
