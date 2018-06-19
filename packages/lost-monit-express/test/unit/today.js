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

const today = require('../../lib/today');

describe('Unit', () => {
  it('today() should return a proper date', async () => {
    const res = await today();

    const splitted = res.split('-');
    const year = parseInt(splitted[0], 10);
    const month = parseInt(splitted[1], 10);
    const day = parseInt(splitted[2], 10);
    assert.ok(year > 2017);
    assert.ok(month > 0 && month < 13);
    assert.ok(day > 0 && day < 32);
  });
});
