'use strict';

const utils = require('./lib/utils');

let db = {};

if (process.env.DB_MONGO) {
  utils.log.info('DB_MONGO found, enabling persistent main storage ...');

  db = {
    connector: 'mongodb',
    url: process.env.DB_MONGO,
    // https://github.com/strongloop/loopback-connector-mongodb#additional-properties
    allowExtendedOperators: true,
  };
}

// If the empy opbject is returned here the "datasources.json" content will be used.
module.exports = { db };
