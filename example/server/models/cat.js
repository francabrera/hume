/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const utils = require('../../../packages/hume-utils');

module.exports = Model => {
  // eslint-disable-next-line no-param-reassign
  Model.greet = (msg, options) =>
    Promise.resolve(`Greetings... ${opts.currentUserId}, ${msg}`);

  Model.remoteMethod('greet', {
    accepts: [
      { arg: 'msg', type: 'string' },
      { arg: 'options', type: 'object', http: 'optionsFromRequest' },
    ],
    returns: { arg: 'greeting', type: 'string' },
  });

  utils.lb.addUserId(Model);
};
