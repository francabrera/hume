/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

module.exports = function enableAuthentication(server) {
  if (server.get('auth') === false) {
    return;
  }

  server.enableAuth();
};
