'use strict';

module.exports = server => {
  // To allow SSL in Bluemix.
  server.enable('trust proxy');

  // To make the secutity team happy.
  // But we can't see the security benefit on this:
  // https://isc.sans.edu/diary/The+Security+Impact+of+HTTP+Caching+Headers/17033
  server.enable('etag');
};
