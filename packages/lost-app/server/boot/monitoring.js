'use strict';

// TODO: Implement as LoobBack middleware.

const utils = require('../lib/utils');

// const { version } = require('../../package.json');

// async function shoudlHide(req) {
async function shoudlHide() {
  // let hide = false;
  const hide = false;
  // try {
  // // TODO: Extract path, get hub,group, project, check private data
  // const result = await app.models.Job.
  // } catch(err) {
  // Logger
  // }

  return hide;
}

module.exports = (server, callback) => {
  if (!process.env.DB_ELASTIC) {
    callback();
    return;
  }

  utils.log.info('Elastic is present, initing jLocke ...');
  utils.jLocke
    .init(process.env.DB_ELASTIC, {
      app: server.get('serviceName'),
      // trace: true,
    })
    .then(() => {
      // We use "log.error" (instead "error") because jLocke is not working in both cases.
      utils.log.error('jLocke middleware initialized');
      callback();
    })
    .catch(err => {
      utils.log.error('jLocke init error: ', err);
      callback();
    });

  utils.log.debug('Attaching it to Express ...');
  server.use(
    utils.jLocke.express({
      // To store only the requests with this subpath.
      only: 'api',
      hide: { fun: shoudlHide },
    }),
  );
};
