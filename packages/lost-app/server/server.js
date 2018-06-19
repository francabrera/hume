/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');

const utils = require('./lib/utils');
const cacheSetup = require('./lib/cache');
const { name } = require('../package');

function exitWithError(msg, err) {
  // It's async because it has to report to jLocke (if enabled).
  utils
    .error(msg, err)
    // TODO: When finally is in Node we can clean this a bit.
    .then(() => process.exit(1))
    .catch(errTracking => {
      // We still need to know if the tracking system is failing.
      utils.log.error('Tracking', errTracking);
      process.exit(1);
    });
}

// // To catch exceptions out of LoopBack (it catches the ones thrown inside automatically).
// process.on('uncaughtException', err => exitWithError('uncaughtException', err));
// // Same for Promises.
// process.on('unhandledRejection', err =>
//   exitWithError('unhandledRejection', err),
// );

// App instance creation.

const app = loopback();
module.exports = app;

// App "start" and "stop" methods definition.
// Some of them are exposed but print and do other bin expected
// behavior to avoid to repeat code.

let server;
app.start = (path, opts = {}) => {
  let serviceName;

  if (!path) { exitWithError('The "path" parameter is mandatory'); }

  if (opts.name) {
    serviceName = opts.name;
  } else {
    serviceName = name;
  }

  utils.log.debug('Service name', { serviceName });

  // Some passed parameters needed in the "boot" scripts.
  app.set('serviceName', serviceName);

  if (opts.auth || opts.auth === false) { app.set('auth', opts.auth); }

  if (opts.cache) { app.set('cache.disabled', opts.cache.disabled); }

  if (opts.explorer) {
    app.set('explorer.disabled', opts.explorer.disabled);
    app.set('explorer.mountPath', opts.explorer.mountPath);
    app.set('explorer.version', opts.explorer.version);
    app.set('explorer.title', opts.explorer.title);
    app.set('explorer.description', opts.explorer.description);
    app.set('explorer.termsOfService', opts.explorer.termsOfService);
  }

  utils.log.debug('Bootstrapping "lost-app" ...');
  boot(app, __dirname, err => {
    if (err) { exitWithError('Bootstrapping "lost-app"', err); }

    utils.log.debug('"lost-app" correctly bootstraped, now the user app ...', { path });
    boot(app, path, errMain => {
      if (errMain) {
        exitWithError('Bootstrapping the user app', errMain);
      }

      app.emit('bootedAll');

      if (opts.noHttp === true) { return; }

      cacheSetup(app);

      utils.log.debug('Starting the web server ...');

      server = app.listen(() => {
        // The one returned by Bluemix includes a "/" at the end.
        const baseUrl = app.get('url').replace(/\/$/, '');
        utils.log.debug(`Web server listening at: ${baseUrl}`);

        const urlsInfo = { url: baseUrl };
        if (app.get('loopback-component-explorer')) {
          const explorerPath = app.get('loopback-component-explorer').mountPath;
          urlsInfo.explorer = `${baseUrl}${explorerPath}`;
        }
        utils.log.info('Browse your REST API at', urlsInfo);
      });
    });
  });
};

// HTTP server stop routine, useful in tests.
app.stop = () => {
  if (server) {
    server.close();
    server = null;
    utils.log.info('HTTP server stopped');
  } else {
    utils.log.info('HTTP server stop disabled, not started before');
  }

  // TODO: Close all active connections and stuff here. For this reason
  // now the server runs infinitelly when running it programatically, ie: tests.
  // As a temporal fix we're using the param "--exit" in Mocha >= v4.
  // Nice tool: https://github.com/myndzi/wtfnode
  // Both seems to close nothing.
  // app.removeAllListeners('started');
  // app.removeAllListeners('loaded');
};
