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

describe('index', () => {
  it('should include all documented items', () => {
    assert.equal(
      utils.difference(
        [
          'appEnv',
          'version',
          'validator',
          'lb',
          'logger',
          'sleep',
          'promise',
          'requireDir',
        ],
        Object.keys(utils),
      ),
      0,
    );
  });

  it('should return the the correct result for its methods', () =>
    assert.equal(utils.version, version));
});
