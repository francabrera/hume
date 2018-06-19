/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

// We need advanced usage (vs "component-config") of the explorer for next reasons:
// - To avoid hardcoding the API version, we'll use the package one
// (also the same in "config" file for "restApi").
// - To pass the full path because the standard way (component-config.json)
// seems not to work with our structure.
// https://github.com/strongloop/loopback-component-explorer/tree/5.x-latest#advanced-usage

const path = require('path');

const { version } = require('../../package.json');

const explorer = require('loopback-component-explorer');

module.exports = server => {
  if (server.get('explorer.disabled')) { return; }

  explorer(server, {
    // TODO: Change this in private ones due to security reasons.
    mountPath: server.get('explorer.mountPath') || '/explorer',
    generateOperationScopedModels: true,
    uiDirs: [path.resolve(__dirname, '../../public/explorer')],
    version: server.get('explorer.version') || version,
    apiInfo: {
      title: server.get('explorer.title') || 'lost API',
      description:
        server.get('explorer.description') || 'lost HTTP API specification.',
    },
  });
};
