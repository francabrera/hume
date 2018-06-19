/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const isV6 = require('net').isIPv6;

const elastic = require('elasticsearch');
const ipaddr = require('ipaddr.js');
const isPromise = require('is-promise');

const utils = require('./lib/utils');
const defaults = require('./defaults');
const ensureIndex = require('./lib/ensureIndex');
const today = require('./lib/today');

const errInit = 'URI not found, call "init" before';
let indexReady = false;
let db;
// We can't do it for each day in run time due to performance reasons.
let indexRequests;
let indexErrors;
const typeRequests = 'request';
const typeErrors = 'error';
let app = 'app';

function sendToDb(index, type, body) {
  utils.log.debug('Inserting found request data in the DB', { index, type, body });
  // TODO: Add pipelining
  db.index({ index, type, body })
    .then(() => utils.log.debug('New request info correctly inserted'))
    .catch(err => {
      throw Error(`Adding the requests info: ${err.message}`);
    });
}

module.exports.init = async (uri, opts = {}) => {
  if (!uri) {
    throw new Error(errInit);
  }

  utils.log.debug(`Connecting to DB: ${uri}`);

  const optsElastic = { host: uri };
  if (opts.trace) {
    optsElastic.log = 'trace';
  }

  if (opts.app) {
    utils.log.debug(`"app" options passed: ${opts.app}`);

    if (typeof opts.app !== 'string') {
      throw new Error('Bad app name');
    }

    // eslint-disable-next-line prefer-destructuring
    app = opts.app;
  }

  try {
    db = new elastic.Client(optsElastic);
  } catch (err) {
    throw new Error(`Creating the Elastic client: ${err.message}`);
  }

  // Each new deploy indexes are created including the date in the name.
  // We can't do it for each day in run time due to performance reasons.
  const todayStr = today();
  indexRequests = `${opts.indexRequests ||
    defaults.indexes.api.name}-${todayStr}`;
  indexErrors = `${opts.indexErrors ||
    defaults.indexes.error.name}-${todayStr}`;

  utils.log.debug('Creating proper indexes', {
    indexRequests,
    indexErrors,
  });
  // We don't drop if it already exists, ie: same day deploy.
  try {
    await Promise.all([
      ensureIndex(db, indexRequests, typeRequests),
      ensureIndex(db, indexErrors, typeErrors),
    ]);
  } catch (err) {
    throw Error(`Creating the indexes: ${err.message}`);
  }

  utils.log.debug('Indexes created');
  indexReady = true;
};

module.exports.error = async (message, error, opts = {}) => {
  if (!message) {
    throw new Error('A custom message is mandatory');
  }
  if (!error) {
    throw new Error('An error is mandatory');
  }

  utils.log.debug('New error', { message, opts });

  // We don't use the Elastic until the index is created.
  // TODO: Some packets could be lost during each deploy -> use a queue.
  if (!indexReady) {
    // eslint-disable-next-line no-console
    console.warn('Error not logged (index not created)', error);
    return;
  }

  const errorInfo = {
    app,
    message,
    timestamp: new Date(),
    errorMessage: error.message,
    errorStack: error.stack,
  };

  if (opts.userId) {
    errorInfo.userId = opts.userId;
    utils.log.debug(`UserId passed: ${opts.userId}`);
  }

  await db.index({ index: indexErrors, type: typeErrors, body: errorInfo });
};

module.exports.express = (opts = {}) => {
  utils.log.debug('Checking the passed options');

  let only;
  if (opts.only) {
    if (typeof opts.only !== 'string' && !utils.isArray(opts.only)) {
      throw new Error('"only" should be string or array');
    }

    // Array or string supported.
    // eslint-disable-next-line prefer-destructuring
    only = opts.only;
    if (typeof only === 'string') {
      only = [only];
    }
  }

  // To keep backward compatibility.
  if (!opts.hideBody && opts.hide) {
    // eslint-disable-next-line no-param-reassign
    opts.hideBody = opts.hide;
  }

  if (opts.hideBody) {
    if (typeof opts.hideBody !== 'object') {
      throw new Error('"hide" should be an object');
    }

    if (
      opts.hideBody.fun &&
      (typeof opts.hideBody.fun !== 'function' || isPromise(opts.hideBody.fun))
    ) {
      throw new Error('"hide" should be a function or a promise');
    }
  }

  // TODO: Add also checks for subfields.

  return (req, res, next) => {
    utils.log.debug('New request');

    next();

    if (!indexReady) {
      // eslint-disable-next-line no-console
      console.warn('Request not logged (index not created)', req);
      return;
    }

    // "originalUrl" is unique always present (vs "path" and "baseUrl").
    if (only) {
      const matchAny = !utils.some(only, itemOnly => {
        if (only && req.originalUrl.indexOf(itemOnly) === -1) {
          return true;
        }

        return false;
      });

      // We don't want to debug the originalUrl because it includes the user token.
      utils.log.debug('Request checked (hidden path)', {
        path: req.path,
        baseUrl: req.baseUrl,
        matchAny,
      });

      if (!matchAny) {
        return;
      }
    }

    const reqInfo = {
      app,
      path: req.path,
      method: req.method,
      protocol: req.protocol,
      originalUrl: req.originalUrl,
      timestamp: new Date(),
    };

    if (req.headers['user-agent']) {
      reqInfo.agent = req.headers['user-agent'];
    }

    // TODO: If not optional add at the object creation.
    if (req.headers.host) {
      reqInfo.host = req.headers.host;
    }

    if (opts.allHeaders) {
      reqInfo.headers = req.headers;
    }

    if (req.ip) {
      // TODO: Elastic only support v4 IP addresses, so we need to convert it.
      // https://www.elastic.co/guide/en/elasticsearch/reference/current/ip.html
      let goodIp = req.ip;
      if (isV6(goodIp)) {
        utils.log.debug('Detected v6 IP address, converting it to v4 ...');
        const address = ipaddr.parse(goodIp);
        goodIp = address.toIPv4Address().toString();
      }

      reqInfo.ip = goodIp;
      utils.log.debug(`IP addr: ${reqInfo.ip}`);
    }

    if (req.params && Object.keys(req.params).length > 0) {
      reqInfo.params = req.param;
      utils.log.debug('Parameters found:', req.params);
    }

    if (req.userId) {
      reqInfo.userId = req.userId;
      utils.log.debug(`UserId passed: ${req.userId}`);
    }

    // We need to wait for the route to finish to get the correct statusCode and duration.
    // https://nodejs.org/api/http.html#http_event_finish
    res.on('finish', () => {
      utils.log.debug('Request ended');

      const duration = res.getHeader('x-response-time');
      if (duration) {
        reqInfo.duration = duration;
      }

      reqInfo.responseCode = res.statusCode;

      // Adding the body.
      if (
        !req.body ||
        Object.keys(req.body).length < 1 || // with non empty body
        !opts.hideBody
      ) {
        utils.log.debug('No "hide" or no body, sending ...');
        sendToDb(indexRequests, typeRequests, reqInfo);
      } else {
        reqInfo.body = req.body;

        // Hiding the options (if "hideBody")
        // We use async stuff here so better inside this callback to
        // avoid a mess.
        // path    field     fun
        // No       No       Yes -> Hide full body for all paths if fun
        // Yes      No       No  -> Hide full body for this path
        // Yes      No       Yes -> Hide full body for this path if fun
        // No       Yes      No  -> Hide field for all paths
        // No       Yes      Yes -> Hide field for all paths if fun
        // Yes      Yes      No  -> Hide field for this path
        // Yes      Yes      Yes -> Hide field for this path if fun
        const hidePath =
          opts.hideBody.path && reqInfo.path.indexOf(opts.hideBody.path) !== -1;

        if (opts.hideBody.fun) {
          let condPromise = opts.hideBody.fun(req);
          utils.log.debug('To hide (path):', { hidePath });

          if (!isPromise(condPromise)) {
            condPromise = Promise.resolve(condPromise);
          }

          condPromise
            .then(hideFun => {
              utils.log.debug('To hide (fun):', { hideFun });

              if (hideFun) {
                utils.log.debug('Deleting body');
                // TODO: Try to avoid this delete to improve performance.
                delete reqInfo.body; // "Hide full body"
              }
              sendToDb(indexRequests, typeRequests, reqInfo);
            })
            .catch(err => {
              // eslint-disable-next-line no-console
              console.error(
                'Running the "hide.fun" promise, not storing' +
                  'the data due to privacy reasons',
                err,
              );
            });
        } else if (
          !opts.hideBody.field && // "hide.field" not present
          (!opts.hideBody.path || hidePath) // "path" is not blocking
        ) {
          utils.log.debug('Deleting body');

          // TODO: Try to avoid this delete to improve performance.
          delete reqInfo.body;
          sendToDb(indexRequests, typeRequests, reqInfo);
        } else {
          utils.log.debug('Checking if we need to delete any field');
          const hideField =
            opts.hideBody.field && reqInfo.body[opts.hideBody.field];

          // Dropping specific fields.
          if (
            hideField && // only if field name matches.
            (!opts.hideBody.path || hidePath)
          ) {
            utils.log.debug(`Dropping hidden field: ${opts.hideBody.field}`);

            delete reqInfo.body[opts.hideBody.field];
          }

          sendToDb(indexRequests, typeRequests, reqInfo);
        }
      }
    });
  };
};
