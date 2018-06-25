/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const utils = require('../../../../lib/utils');
const check = require('../check');

module.exports = (whitelist, blacklist, limiters, only, tor, tagId) => (
  req,
  res,
  next,
) => {
  check(req, whitelist, blacklist, limiters, tor, tagId)
    .then(result => {
      if (only || result.allow || (!result.block.ip && !result.block.user)) {
        next();
        return;
      }

      if (result.block.ip) {
        blacklist.ips.push(req.ip);
      }
      if (result.block.userId) {
        blacklist.ips.push(req.userId);
      }

      // Aborting for performance reasons: https://nodejs.org/api/http.html#http_request_abort
      // TODO: Not working, only can found "destroy" in the node.js code:
      // https://github.com/nodejs/node/blob/master/lib/_http_outgoing.js#L201
      // req.abort();
      req.destroy();

      // TODO: Jlocke? Improve monitoring
      utils.log.info('Bad request dropped silently, IP/userID blacklisted', {
        ip: req.ip,
        userId: req.userId,
        url: req.url,
        reason: result.reason,
      });
    })
    .catch(err => {
      next();
      utils.log.error('Firewall error, checks disabled', err);
    });
};
