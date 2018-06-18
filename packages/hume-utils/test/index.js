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
