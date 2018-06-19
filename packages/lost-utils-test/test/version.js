'use strict';

const assert = require('assert');

const utilsTest = require('..');
const { version } = require('../package');

describe('version', () => {
  it('should include the correct library version', () =>
    assert.equal(utilsTest.version, version));
});
