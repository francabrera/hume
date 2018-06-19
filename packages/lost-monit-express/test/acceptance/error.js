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

const elastic = require('elasticsearch');
const utils = require('../../lib/utils');

const monit = require('../..');
const today = require('../../lib/today');
// const defaults = require('../defaults');

const url = 'localhost:9200';
// Random to avoid confusion running the tests locally.
const index = Math.random()
  .toString(36)
  .substr(2, 10);
const indexErrors = `${index}-error`;
const indexErrorsFull = `${indexErrors}-${today()}`;
const appName = 'testName';

if (!process.env.DB_ELASTIC_TEST) {
  utils.log.info('Environment variable "DB_ELASTIC_TEST" not present, skipping "monit-express tests"');
} else {
  utils.log.debug(`Starting, initing the DB connection: ${url}`);
  const db = new elastic.Client({
    host: url,
    // log: 'trace',
  });

  describe('error()', () => {
    before(async () => {
      await monit.init(url, {
        // trace: true,
        app: appName,
        indexRequests: index,
        indexErrors,
      });

      utils.log.debug('monit started, waiting a bit for index creation to finish');
      utils.sleep(10000);
    });

    it('should save the error', async () => {
      utils.log.debug('Making the error request ...');
      const errMsgCustom = 'Test custom';
      const errMsg = 'Test error';
      const userId = 'testUserId';

      await monit.error(errMsgCustom, new Error(errMsg), { userId });
      // utils.log.debug('Error request done');

      // utils.log.debug('Waiting a bit ...');
      utils.sleep(10000);

      // utils.log.debug('Checking the error saved stuff ...');
      const result = await db.search({ index: indexErrorsFull, type: 'error' });
      // utils.log.debug('Response got:', result);

      // Only cheking some of them to KISS.
      assert.equal(result.timed_out, false);
      assert.equal(result.hits.total, 1);
      /* eslint-disable no-underscore-dangle */
      assert.equal(result.hits.hits[0]._index, indexErrorsFull);
      assert.equal(typeof result.hits.hits[0]._id, 'string');
      assert.equal(result.hits.hits[0]._id.length, 20);
      assert.equal(result.hits.hits[0]._source.app, appName);
      assert.equal(result.hits.hits[0]._source.message, errMsgCustom);
      assert.equal(result.hits.hits[0]._source.errorMessage, errMsg);
      assert.equal(typeof result.hits.hits[0]._source.errorStack, 'string');
      assert.equal(result.hits.hits[0]._source.userId, userId);
      // Elastic returns it as an string.
      assert.equal(typeof result.hits.hits[0]._source.timestamp, 'string');
      /* eslint-enable no-underscore-dangle */
    });
  });
}
