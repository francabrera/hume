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

const express = require('express');
const bodyParser = require('body-parser');
const elastic = require('elasticsearch');
const makeReq = require('request-promise-native');
const responseTime = require('response-time');

const utils = require('../../lib/utils');
const monit = require('../..');
const today = require('../../lib/today');
// const defaults = require('../defaults');

const port = 7777;
const url = 'localhost:9200';
// Random to avoid confusion running the tests locally.
const index = Math.random()
  .toString(36)
  .substr(2, 10);
const indexFull = `${index}-${today()}`;
const indexErrors = `${index}-error`;
const appName = 'testName';
const excludePath = 'login';
const excludeField = 'password';
const testUser = 'ola';
const testUserId = 'AAA';
const uriServer = `http://127.0.0.1:${port}`;
const pathBase = '/api';
const pathLogin = `${pathBase}/login`;
const pathHidden = '/hidden';
const searchOpts = {
  index: indexFull,
  type: 'request',
  sort: ['timestamp:desc'],
};
let defineFun = false;
let server;
let reqLogin;

let db;
if (process.env.DB_ELASTIC_TEST) {
  utils.log.debug(`Starting, initing the DB connection: ${url}`);

  db = new elastic.Client({
    host: url,
    // log: 'trace',
  });

  describe('express()', () => {
    // TODO: Not working.
    // before(async () => {
    // beforeEach(async () => {
    beforeEach(done => {
      monit
        .init(url, {
          // trace: true,
          app: appName,
          indexRequests: index,
          indexErrors,
        })
        .then(() => {
          const app = express();

          app.use(responseTime({ suffix: false }));
          app.use(bodyParser.json());
          // To save also the "userId" field.
          // Probably you need something in runtime here.
          app.use((req, res, next) => {
            req.userId = (() => testUserId)();
            next();
          });
          const opts = {
            only: 'api',
            // TODO: Add a test for this.
            // only: ['api'], // also supported
            hideBody: { path: excludePath, field: excludeField },
          };
          // TODO: Add a test for this.
          // if (defineFun) { opts.hideBody.fun = () => true; }
          if (defineFun) {
            opts.hideBody.fun = () => Promise.resolve(true);
          }

          app.use(monit.express(opts));

          app.get(pathBase, (req, res) => res.send('Hello World!'));
          app.post(pathLogin, (req, res) =>
            res.send({ username: 'test', token: 'aaa' }),
          );
          app.get(pathHidden, (req, res) => res.send('Hello hidden!'));

          // Lets give a time to end the index creation.
          utils.sleep(10000);

          utils.log.debug('Starting the Express server ...');
          // TODO: Not working.
          // const listen = util.promisify(app.listen);
          // server = await listen(port);
          server = app.listen(port, () => {
            utils.log.debug(`Example app listening on port: ${port}`);

            done();
          });
        });
    });

    it('should save all data for non hidden fields', async () => {
      utils.log.debug('Making the HTTP request ...');
      const agent = 'test-agent';
      const httpRes = await makeReq(`${uriServer}${pathBase}`, {
        headers: { 'User-Agent': agent },
      });
      utils.log.debug('HTTP request done', httpRes);

      assert.equal(httpRes, 'Hello World!');
      // TODO: Add a test for "dropTime" and check it here.
      utils.log.debug('HTTP request confirmed ...', {});

      // The middleware writes to the DB in async to avoid force the server
      // to wait for these operation to answer more HTTP requests. So we have to
      // wait a bit here to let it finish.
      utils.log.debug('Waiting a bit ...');
      utils.sleep(10000);

      utils.log.debug('Checking the saved stuff ...');
      const body = await db.search(searchOpts);
      utils.log.debug('Response got:', body);
      // Only cheking some of them to KISS.
      assert.equal(body.timed_out, false);
      assert.equal(body.hits.total, 1);
      /* eslint-disable no-underscore-dangle */
      assert.equal(body.hits.hits[0]._index, indexFull);
      assert.equal(typeof body.hits.hits[0]._id, 'string');
      assert.equal(body.hits.hits[0]._id.length, 20);
      assert.equal(body.hits.hits[0]._source.app, appName);
      assert.equal(body.hits.hits[0]._source.path, pathBase);
      assert.equal(body.hits.hits[0]._source.method, 'GET');
      assert.equal(body.hits.hits[0]._source.protocol, 'http');
      assert.equal(
        typeof parseFloat(body.hits.hits[0]._source.duration),
        'number',
      );
      assert.equal(body.hits.hits[0]._source.ip, '127.0.0.1');
      assert.equal(body.hits.hits[0]._source.host, '127.0.0.1:7777');
      assert.equal(body.hits.hits[0]._source.agent, agent);
      assert.equal(body.hits.hits[0]._source.originalUrl, pathBase);
      // // Elastic returns it as an string.
      assert.equal(typeof body.hits.hits[0]._source.timestamp, 'string');
      assert.equal(body.hits.hits[0]._source.responseCode, 200);
      assert.equal(body.hits.hits[0]._source.userId, testUserId);
      /* eslint-enable no-underscore-dangle */

      server.close();
    });

    it('should only inspect not hidden subpaths (if "path")', async () => {
      utils.log.debug('Making the HTTP request ...');
      await makeReq(`${uriServer}${pathHidden}`);
      utils.log.debug('HTTP request done');

      utils.log.debug('Waiting a bit ...');
      utils.sleep(10000);

      utils.log.debug('Checking the saved stuff ...');
      const body = await db.search(searchOpts);
      utils.log.debug('Response got:', body);
      assert.equal(body.timed_out, false);
      assert.equal(body.hits.total, 1);
      /* eslint-enable no-underscore-dangle */

      server.close();
    });

    it('should hide desired fields for POSTs (if "hide")', async () => {
      utils.log.debug('Making the HTTP request ...');
      reqLogin = {
        uri: `${uriServer}${pathLogin}`,
        method: 'POST',
        body: { username: 'ola', password: 'kase' },
        json: true,
      };

      await makeReq(reqLogin);
      utils.log.debug('HTTP request done', reqLogin);

      utils.log.debug('Waiting a bit ...');
      utils.sleep(10000);

      utils.log.debug('Checking the saved stuff ...');
      const body = await db.search(searchOpts);
      utils.log.debug('Response got:', body);
      // Only cheking some of them to KISS.
      assert.equal(body.timed_out, false);
      assert.equal(body.hits.total, 2);
      assert.equal(body.hits.hits.length, 2);

      const item = body.hits.hits[0];
      /* eslint-disable no-underscore-dangle */
      assert.equal(item._source.path, pathLogin);
      assert.equal(item._source.method, 'POST');
      assert.equal(item._source.body[excludeField], undefined);
      assert.equal(item._source.body.username, testUser);
      /* eslint-enable no-underscore-dangle */

      server.close();

      // Ready for the next test.
      defineFun = true;
    });

    it('should only have "fun" into account (if defined)', async () => {
      utils.log.debug('Making the HTTP request ...');
      await makeReq(reqLogin);
      utils.log.debug('HTTP request done', reqLogin);

      utils.log.debug('Waiting a bit ...');
      utils.sleep(10000);

      utils.log.debug('Checking the saved stuff ...');
      const body = await db.search(searchOpts);
      utils.log.debug('Response got:', body);
      assert.equal(body.timed_out, false);
      assert.equal(body.hits.total, 3);

      const item = body.hits.hits[0];
      /* eslint-disable no-underscore-dangle */
      assert.equal(item._source.path, pathLogin);
      assert.equal(item._source.method, 'POST');
      assert.equal(item._source.body, undefined);
      /* eslint-enable no-underscore-dangle */

      server.close();
    });
  });
}
