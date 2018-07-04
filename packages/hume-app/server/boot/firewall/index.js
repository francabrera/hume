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
// https://github.com/simlu/lambda-rate-limiter#why-not-using-existing-similar-modules
const limiter = require('lambda-rate-limiter');

const utils = require('../../lib/utils');
const defaults = require('./defaults');

const express = require('./lib/middlewares/express');

const torFetch = util.promisify(torTest.fetch);

class Firewall {
  constructor(opts = {}) {
    this.detectOnly = opts.detectOnly || defaults.detectOnly;
    this.tagId = opts.tagId || defaults.tagId;

    this.tor = opts.tor || defaults.tor;

    // TODO: In memory for now, if we need something bigger move to:
    // https://www.npmjs.com/package/hashtable-patch-valeriansaliou
    this.blacklist = {
      ips: (opts.blacklist && opts.blacklist.ips) || [],
      users: (opts.blacklist && opts.blacklist.users) || [],
    };
    this.whitelist = {
      ips: (opts.whitelist && opts.whitelist.ips) || [],
      users: (opts.whitelist && opts.whitelist.users) || [],
      admins: opts.whitelist && opts.whitelist.admins,
      tagAdmin:
        (opts.whitelist &&
          opts.whitelist.admins &&
          opts.whitelist.admins.tag) ||
        defaults.whitelist.tagAdmin,
    };

    this.limiters = {};
    let limitIpTotal = defaults.ratelimit.ip.total;
    let limitIpInterval = defaults.ratelimit.ip.interval * 1000;

    // Sets the "max" option here, https://github.com/isaacs/node-lru-cache#options
    // (passed as "uniqueTokenPerInterval" in "lambda-rate-limiter").
    this.maxInterval = defaults.ratelimit.maxInterval;

    if (opts.ratelimit) {
      if (opts.ratelimit.maxInterval) {
        this.maxInterval = opts.ratelimit.maxInterval;
      }

      if (opts.ratelimit.ip) {
        if (opts.ratelimit.ip.total) {
          limitIpTotal = opts.ratelimit.ip.total;
        }
        if (opts.ratelimit.ip.interval) {
          limitIpInterval = opts.ratelimit.ip.interval;
        }
      }
    }

    if (!opts.ratelimit || opts.ratelimit.ip !== false) {
      this.limiters.ip = limiter({
        interval: limitIpInterval,
        uniqueTokenPerInterval: this.maxInterval,
      });
    }

    let limitIpPortTotal = defaults.ratelimit.ipPort.total;
    let limitIpPortInterval = defaults.ratelimit.ipPort.interval;

    if (opts.ratelimit && opts.ratelimit.ipPort) {
      if (opts.ratelimit.ipPort.total) {
        limitIpPortTotal = opts.ratelimit.ipPort.total;
      }
      if (opts.ratelimit.ipPort.interval) {
        limitIpPortInterval = opts.ratelimit.ipPort.interval;
      }
    }

    if (!opts.ratelimit || opts.ratelimit.ipPort !== false) {
      this.limiters.ipPort = limiter({
        interval: limitIpPortInterval,
        uniqueTokenPerInterval: this.maxInterval,
      });
    }

    let limitUserTotal = defaults.ratelimit.user.total;
    let limitUserInterval = defaults.ratelimit.user.interval;

    if (opts.ratelimit && opts.ratelimit.user) {
      if (opts.ratelimit.user.total) {
        limitUserTotal = opts.ratelimit.user.total;
      }
      if (opts.ratelimit.user.interval) {
        limitUserInterval = opts.ratelimit.user.interval;
      }
    }

    if (!opts.ratelimit || opts.ratelimit.user !== false) {
      this.limiters.user = limiter({
        interval: limitUserInterval,
        uniqueTokenPerInterval: this.maxInterval,
      });
    }

    // TODO: Still not implemented
    // this.crafted = opts.crafted || defaults.crafted;

    this.express = express(
      this.whitelist,
      this.blacklist,
      this.limiters,
      this.detectOnly,
      this.tor,
      this.tagId,
      {
        ip: limitIpTotal,
        ipPort: limitIpPortTotal,
        user: limitUserTotal,
      },
    );
    this.torReady = false;
    this.intervalTor = null;

    if (this.breathe) {
      const intervalBreathe = setInterval(() => {
        torFetch()
          .then(() => utils.log.info('Lists cleaned (interval)'))
          .catch(err => utils.log.error('cleaning the lists (interval)', err));
      }, this.breathe);
      // To prevent it from blocking the server: http://nodejs.org/dist/latest-v6.x/docs/api/timers.html#timers_timeout_unref)
      intervalBreathe.unref();
    }
  }

  // interval in min (6 hours)
  async tor(interval = 360) {
    // TOR exit nodes blacklisting.
    utils.log.info('Fetching Tor exit node list ...');
    try {
      await torFetch();
      this.torReady = true;
      utils.log.info('Tor exit nodes list correctly fetched');
    } catch (err) {
      utils.log.error('Fetching Tor exit node list, feature disabled', err);
    }

    clearInterval(this.intervalTor);
    if (interval === 0) {
      return;
    }
    this.intervalTor = setInterval(() => {
      torFetch()
        .then(() => utils.log.info('Tor exit nodes cache refreshed'))
        .catch(err => utils.log.error('Refreshing Tor exit node list', err));
    }, interval * 60 * 1000);
    this.torInterval.unref();
  }
}

module.exports = Firewall;
