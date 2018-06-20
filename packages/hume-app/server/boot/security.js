/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

module.exports = server => {
  // To allow SSL in Bluemix.
  server.enable('trust proxy');

  // To make the secutity team happy.
  // But we can't see the security benefit on this:
  // https://isc.sans.edu/diary/The+Security+Impact+of+HTTP+Caching+Headers/17033
  server.enable('etag');
};
