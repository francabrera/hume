'use strict';

const util = require('util');

const WebSocketServer = require('uws').Server;

const utils = require('./lib/utils');
const cfg = require('./cfg');
const checkParams = require('./lib/checkParams');

let cache = {};
let appLb;
const { url, port } = utils.appEnv;

// TODO: "util.promisify" not working for "ws.send".
function callback(err, ws) {
  if (err) {
    utils.error('Sending', err);
    ws.drop();
  } else {
    utils.log.debug('Message correctly sent');
  }
}

function urlToWs(uri) {
  return uri.replace(/(http)(s)?:\/\//, 'ws$2://');
}


let wsServer;
const app = {};

module.exports = app;

app.start = (serviceName, updateCache, token) => {
  utils.log.debug('Checking the environment');
  if (!url || !port) {
    utils.error('Env problem: URL or port not found');
    process.exit(1);
  }

  utils.log.debug('Creating the WS server ...');
  // TODO: Manage errors
  // utils.error('Problems finding a port to use, quiting ...');
  wsServer = new WebSocketServer({ port });
  // We don't want' to print the token.
  utils.log.info('Server listening on:', {
    url: urlToWs(url),
    port,
    interval: cfg.interval,
  });

  updateCache().then(res => {
    cache = res;
    utils.log.info('Cache updated, setting interval ...');
    // 1000 * 60 -> to set it in minutes.
    const intervalCache = setInterval(
      () => {
        utils.log.info('Updating WS cache ...');

        updateCache().then(resU => { cache = resU; });
      },
      cfg.interval.cache * 1000 * 60,
    );

    wsServer.on('error', err => {
      utils.error('Server error', err);
    });

    wsServer.on('connection', ws => {
      // TODO: Also store the family: IPv4 vs IPv6
      const portC = ws._socket.remotePort; // eslint-disable-line no-underscore-dangle
      const ip = ws._socket.remoteAddress; // eslint-disable-line no-underscore-dangle

      utils.log.debug('New connection', {
        ip,
        port: portC,
      });

      let cacheKey;
      try {
        cacheKey = checkParams(ws, ip, port, token);
      } catch (err) {
        // 400 - Bad request
        // We use "utils.log" because an app should log all login attempts.
        utils.error(JSON.stringify({ ip, port: portC }, err));

        // The library does not support this part of standard.
        // ws.reject(400, msg);

        ws.send(JSON.stringify({ error: err.message, code: 400 }), error =>
          callback(error, ws),
        );

        return;
      }

      utils.log.debug('Sending the last info:', {
        ip,
        port: portC,
        cacheKey,
        cache,
      });
      let result = cache;
      // All data is served if the passed filter is not found.
      if (cacheKey && cache[cacheKey]) { result = cache[cacheKey]; }

      const sendInfo = () =>
        ws.send(JSON.stringify(result), error => callback(error, ws));

      const intervalSend = setInterval(
        sendInfo,
        cfg.interval.cache * 1000 * 60,
      );

      sendInfo();

      ws.on('close', (reasonCode, desc) => {
        clearInterval(intervalCache);
        clearInterval(intervalSend);

        utils.log.info('Client disconnected', {
          reasonCode,
          description: desc,
          ip,
          port: portC,
        });
      });
    });
  });
};

app.stop = async () => {
  appLb.stop();
  if (wsServer) {
    try {
      await util.promisify(wsServer.close)();
    } catch (err) {
      utils.error('Closing the WS server');
      throw err;
    }

    wsServer = null;
    utils.log.info('WSS server stopped');
  } else {
    utils.log.info('WSS server stop disabled, not started before');
  }
};
