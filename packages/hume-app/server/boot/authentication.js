/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const utils = require('../lib/utils');

module.exports = function enableAuthentication(server) {
  // To include always the userId in the request (not supported by LoopBack).
  server.use((req, res, next) => {
    utils.lb.getUserId(req)
      .then(userId => {
        if (userId) {
          req.userId = userId;
        }

        next();
      })
      .catch(err => {
        if (err.message !== 'Token not found') {
          utils.error('Getting the token for the IP', { ip: req.ip });
        }

        next();
      });
    // TODO: Add finally (for next) when supported.
  });

  if (server.get('auth') === false) {
    return;
  }

  server.enableAuth();
};
