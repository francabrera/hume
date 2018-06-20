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

const shot = require('snap-shot-it');
const supertest = require('supertest');
// We can't require utils package here to avoid a circular dep.
const lodash = require('lodash');

const { version } = require('./package');

const request = app => supertest(app);
// A shortcut.
request.login = async creds => {
  let credsPassed = null;
  if (creds) {
    if (!lodash.isObject(creds)) {
      throw new Error('Object expected');
    }

    credsPassed = creds;
  }

  let res;
  try {
    res = await request
      .post('/api/users/login')
      .send(credsPassed)
      .expect(200);
  } catch (err) {
    throw new Error(`Making login: ${err.message}`);
  }

  return res.body;
};

// The easiest way to play with promises in Mocha:
// https://wietse.loves.engineering/testing-promises-with-mocha-90df8b7d2e35
async function throwsAsync(block, errorRexp) {
  try {
    await block();
  } catch (e) {
    // To be consistent with the Node.js "assert.throws" behavior we reuse it.
    if (errorRexp) {
      assert.throws(() => {
        throw e;
      }, errorRexp);
    }
    // We need this return because we're catching the thrown error,
    // if not, the next assert.fail would be reached when the regexp matches.
    return;
  }

  assert.fail('Missing expected exception');
}

module.exports = {
  version,
  request,
  shot,
  throwsAsync,
};
