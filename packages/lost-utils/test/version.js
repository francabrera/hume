'use strict';

const assert = require('assert');

const utils = require('..');
const { version } = require('../package');

describe('version', () => {
  it('should include the correct library version', () =>
    assert.equal(utils.version, version));
});
