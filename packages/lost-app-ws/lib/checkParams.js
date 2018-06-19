/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const querystring = require('querystring');

const utils = require('../lib/utils');

module.exports = (ws, ip, port, passedToken) => {
  if (!ws.upgradeReq.headers && !ws.upgradeReq.url) {
    throw new Error('Request rejected: headers and query string mandatories');
  }

  const query = querystring.parse(ws.upgradeReq.url.slice(2));
  // const query = querystring.parse(ws.upgradeReq.url);
  const { headers } = ws.upgradeReq;
  utils.log.debug('headers parsed', {
    headers,
    query,
    ip,
    port,
  });

  // All is public but we use basic auth to avoid generic scrappers.
  if (passedToken) {
    if (!query.token) {
      throw new Error('Request rejected: "token" parameter not found');
    }

    utils.log.debug('Parsing the "authorization" token ...');

    if (typeof query.token !== 'string') {
      throw new TypeError('Request rejected: Error parsing the token');
    }

    if (query.token !== passedToken) {
      throw new Error('Request rejected: "token" not valid');
    }
  }

  let cacheKey;
  if (query.filter) {
    if (typeof query.filter !== 'string') {
      throw new TypeError('Request rejected: Error parsing the "key" param');
    }
    utils.log.debug('The "key" param is present ...', { filter: query.filter });
    cacheKey = query.filter;
  }

  return cacheKey;
};
