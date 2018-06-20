/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const assert = require('assert');

const utils = require('..');
const { version } = require('../package');

describe('version', () => {
  it('should include the correct library version', () =>
    assert.equal(utils.version, version));
});
