'use strict';

// This file can't be inside "boot" because we need to boot the user model first.

const url = require('url');
const modelCache = require('loopback-ibmresearch-mixin/lib/modelCache');

const utils = require('../lib/utils');

const opts = {
  methods: [],
  ttl: 30,
  reloadAfterReturn: false,
  disableDefault: false,
  type: 'memory',
};

if (process.env.DB_REDIS) {
  utils.log.info('DB_REDIS found, enabling model methods caching ...');

  let uriParsed;
  try {
    uriParsed = url.parse(process.env.DB_REDIS);
    utils.log.debug('DB_REDIS correctly parsed');

    opts.type = 'redis';
    opts.configuration = {
      host: uriParsed.hostname,
      password: uriParsed.auth,
      port: uriParsed.port,
      dbNumber: uriParsed.path.slice(1),
    };
  } catch (err) {
    utils.log.error(
      'Parsing the env var DB_REDIS, using memory as fallback',
      err,
    );
  }
}

module.exports = server => {
  if (server.get('cache.disabled')) { return; }

  const methods = server.get('cache.methods');

  utils.map(methods, (meths, modelName) => {
    utils.map(meths, meth => opts.methods.push(meth));

    modelCache(server.models[modelName], opts);
  });
};
