/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const util = require('util');

const torTest = require('tor-test');

const utils = require('../../../lib/utils');

const isTor = util.promisify(torTest.isTor);

module.exports = async (
  req,
  whitelist,
  blacklist,
  limiters,
  tor,
  tagId,
  limits,
) => {
  const result = { allow: true, block: false };
  const port = req.connection.remotePort;
  const withWhite = {
    ips: utils.isEmpty(whitelist.ips),
    users: utils.isEmpty(whitelist.users),
  };

  if (withWhite.ips) {
    if (!whitelist.ips.includes(req.ip)) {
      result.allow = false;
      result.block = false;
      result.reason = 'whitelist:ip';
    } else if (
      withWhite.users &&
      req.userId &&
      !whitelist.users.includes(req[tagId])
    ) {
      result.allow = false;
      result.block = false;
      result.reason = 'whitelist:user';
    } else if (whitelist.admins && !req[whitelist.tagAdmin]) {
      result.allow = false;
      result.block = false;
      result.reason = 'whitelist:admin';
    }

    if (!result.allow) {
      return result;
    }
  }

  if (blacklist.ips.includes(req.ip)) {
    result.allow = false;
    result.block = false;
    result.reason = 'blacklist:ip';

    return result;
  }

  if (req.userId && blacklist.users.includes(req.userId)) {
    result.allow = false;
    result.block = false;
    result.reason = 'blacklist:user';

    return result;
  }

  if (tor) {
    if (await isTor(req.ip, false)) {
      result.allow = false;
      result.block = true;
      result.reason = 'tor';

      return result;
    }
  }

  if (limiters.ip) {
    try {
      await limiters.ip.check(limits.ip, req.ip);
    } catch (err) {
      result.allow = false;
      result.block = true;
      result.reason = 'rate:ip';

      return result;
    }
  }

  if (limiters.ipPort) {
    try {
      await limiters.IpPort.check(limits.ipPort, `${req.ip}:${port}`);
    } catch (err) {
      result.allow = false;
      result.block = true;
      result.reason = 'rate:ip/port';

      return result;
    }
  }

  if (!req.userId || !limiters.user) {
    return result;
  }

  try {
    await limiters.user.check(limits.user, req.userId);
  } catch (err) {
    result.allow = false;
    result.block = true;
    result.reason = 'rate:user';
  }

  return result;
};
