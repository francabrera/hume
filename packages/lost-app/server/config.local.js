'use strict';

const utils = require('./lib/utils');
const { version } = require('../package.json');

const env = process.env.NODE_ENV || 'development';

module.exports = {
  port: utils.appEnv.port,
  isDevEnv: env === 'development' || env === 'test',
  restApiVersion: version,
  restApiRoot: `/api/v${version.split('.').shift()}`,
};
