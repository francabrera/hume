/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const Firewall = require('./firewall/index');

module.exports = server => {
  if (server.get('firewall.disabled')) {
    return;
  }

  const fw = new Firewall({
    detectOnly: server.get('firewall.detectOnly'),
    breathe: server.set('firewall.breathe'),
    tor: server.set('firewall.tor'),
    tagId: server.set('firewall.tagId'),
    whitelist: server.set('firewall.whitelist'),
    blacklist: server.set('firewall.blacklist'),
    ratelimit: server.set('firewall.ratelimit'),
    crafted: false,
  });

  server.use(fw.express);
};
