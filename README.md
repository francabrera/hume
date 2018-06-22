# hume

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
[![Build Status](https://travis-ci.org/IBMResearch/hume.svg?branch=master)](https://travis-ci.org/IBMResearch/hume)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

:atom_symbol: Microservices framework on top of [LoopBack](http://loopback.io) and [uWebsockets](https://github.com/uNetworking/uWebSockets). Focused in reusability, security and performance.

## Structure

:construction: We use [Lerna](https://github.com/lerna/lerna) to manage the dependencies among the different implementations and allow intalling each package independently. This architecture is more complex that the common one for LoopBacks apps because we support different microservices under the same codebase. So we needed some abstraction to avoid code repetition, but we tried to respect the LoopBack naming everywhere for convenience (a `server` folder, the entry point keeps being the `server.js` file, etc.).

In the [`packages`](packages) folders you can find all you need. Each package includes its own README, please visit them :smile:.

- [**hume-app**](packages/hume-app): Helpers to implement a complete HTTP API microservice.
- [**hume-app-ws**](packages/hume-app-ws): Helpers to implement a websockets microservice.
- [**hume-script**](packages/hume-script): Devops tasks command line client.
- [**hume-utils**](packages/hume-utils): Common helpers among the rest of the packages.
- [**hume-utils-test**](packages/hume-utils-test): Same, but only used in tests.

## Install

- Install the last [Node.js](https://nodejs.org/download) stable version.
- :pizza: Each package can be installed independently.

```sh
npm i -g @hume/app
npm i -g @hume/app-ws
npm i -g @hume/utils

...
```

## Use

:rocket: Please visit the [examples](example) and visit each package documentation to see each API definition.

### Databases

In most of the cases we use external services, so we have defined next environment variables to setup the different environments.

- NODE_ENV: Set it to "production" for deployments. It's importat due to [security](https://github.com/jesusprubio/strong-node#12-returned-errors-dont-include-sensitive-information-about-the-environment-stack-paths-db-queries-etc-cwe-209) and [performance](https://www.dynatrace.com/news/blog/the-drastic-effects-of-omitting-node_env-in-your-express-js-applications) reasons. We think it's a bit confusing with the LoopBack common setup using files with the environment in the name (ie: datasources.production.json). So, simply add the next point ones to enable the persistent service you need in each case.
- DB_MONGO: MongoDB URI, as the main database engine. If not present memory is used as fallback.
- DB_REDIS: Redis URI, for models caching.

```sh
# Only Mongo persistent.
DB_MONGO="mongodb://localhost:27017/test" npm start
```

### Debug

Use next environment variable:

```sh
DBG=true npm start
```

### Tests

They can also be run independently:

```sh
npm test
npm run test-app
npm run test-app-ws
npm run test-script
npm run test-utils
npm run test-utils-test
```

## Contributing

:sunglasses: If you'd like to help please take a look to [this file](.github/CONTRIBUTING.md).
