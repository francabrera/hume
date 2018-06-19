/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

const utils = require('./utils');


// TODO: Move to a file.
const mapping = {
  // eslint-disable-next-line arrow-body-style
  request: name => {
    return {
      index: name,
      // Hardcoded because it was dropped in Elastic 6.
      type: 'request',
      body: {
        properties: {
          app: { type: 'keyword' },
          method: { type: 'keyword' },
          protocol: { type: 'keyword' },
          ip: { type: 'keyword' },
          host: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
          headers: { type: 'object' },
          agent: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
          // TODO: Because of any reason it doesn't work in Elastic, and only for the POST requests.
          // responseCode: { type: 'short' },
          responseCode: { type: 'long' },
          timestamp: { type: 'date' },
          duration: { type: 'float' },
          body: { type: 'object' },
          userId: { type: 'keyword' },
          originalUrl: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
          path: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
        },
      },
    };
  },
  // eslint-disable-next-line arrow-body-style
  error: name => {
    return {
      index: name,
      // Hardcoded because it was dropped in Elastic 6.
      type: 'error',
      body: {
        properties: {
          app: { type: 'keyword' },
          message: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
          errorMessage: { type: 'text' },
          errorStack: { type: 'text' },
          timestamp: { type: 'date' },
          userId: { type: 'keyword' },
        },
      },
    };
  },
};

module.exports = async (db, index, map) => {
  utils.log.debug('Checking if index exists ...', {
    index,
    map,
  });

  let exists;
  try {
    exists = await db.indices.exists({ index });
  } catch (err) {
    throw new Error(`Checking if the indexes exist: ${err.message}`);
  }

  if (!exists) {
    utils.log.debug('Not existent index, creating it ...', {
      index,
      map,
    });

    try {
      await db.indices.create({ index });
      await db.indices.putMapping(mapping[map](index));
    } catch (err) {
      throw new Error(`Creating the index/mapping: ${err.message}`);
    }
  }

  utils.log.debug('Index creation request done ...', {
    index,
    map,
  });
};
