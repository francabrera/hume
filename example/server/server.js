'use strict';

const utils = require('../../packages/lost-utils');
const app = require('../../packages/lost-app');

const name = 'Demo HTTP API';

const log = utils.logger(name);

log.info('Starting the app ...');

app.start(__dirname, {
  name,
  auth: false,
  explorer: {
    title: 'HTTP API Example',
    description: 'Specification demo.',
  },
  cache: { methods: { cat: ['find'] } },
});


module.exports = app;
