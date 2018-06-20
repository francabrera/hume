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
  // Install a `/` route that returns server status
  const router = server.loopback.Router();

  router.get('/', server.loopback.status());

  server.use(router);
};
