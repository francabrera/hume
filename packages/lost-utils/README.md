# lost utils

Some helpers shared among the rest of the packages.

## Install

:coffee: Install [Node.js](https://nodejs.org/download) v8 and then:

```sh
npm i @lost/utils
```

## Use

:pencil: You can visit the complete example [in this tests](./test).

```js
const utils = require('@lost/utils');

console.log('Version');
console.log(utils.version);
```

## API

:eyes: Full specification. All Lodash methods are in the root, so you can call them directly, ie: `utils.map()`.

### `version`

The actual version of the library.

- `version` (string) - Version number.

### `validator`

A wrapper for [validator.js](https://github.com/chriso/validator.js).

### `appEnv`

The result of this method to parse the important info from Bluemix app environments (from the package ["cfenv"](https://www.npmjs.com/package/cfenv)). This package doesn't randomize the port, which is a problem to run all microserices locally in parallel. So we trick it in this library if the env var `Q_MICRO` is set to true.

- https://github.com/cloudfoundry-community/node-cfenv#getappenvoptions
- https://github.com/hoodiehq-archive/node-ports#ports-registry

- `appEnv` (object) - The environment in JSON format.

### `async lb.getUserId(req) -> id`

To get the user ID in LoopBack from a request object. Useful with [this middleware](https://github.com/IBMResearch/jlocke).

- `req` (object) - A Loopback "request" object.
- `id` (string) - The user identifierm `null` if not found.

### `async lb.createUser(app, opts) -> null`

To create a first user and the proper roles. Useful with [this middleware](https://github.com/IBMResearch/express-middleware-todb).

- `app` (object) - A Loopback "app" object.
- `opts` (object) - An object with:
  - `username` (string) - Username of the user to create. (default: 'admin')
  - `password` (string) - Password of the user to create. (default: 'admin')
  - `email` (string) - Email of the user to create. (default: 'admin@admin@myapp.mybluemix.net')

### logger(name) -> log

A wrapper around [Bunyan](https://github.com/trentm/node-bunyan) (with [prettystream](https://github.com/mrrama/node-bunyan-prettystream)), but only the next 3 [levels](https://github.com/trentm/node-bunyan#levels) are allowed.

- `name` (string) - Project name to tag the messages. (default: 'app')
- `log` (object) - Including next points methods.

#### `log.info(args) -> null`

A wrapper around `bunyan.info` to print (and send to jLocke if setup) only critical errors. To print things that are not errors but we want them always printed, things we want to know that happened (ie: bad login). Keep it to the minimal, because it's also printed in production and "console.*" are sync operations.

#### `log.error(args) -> null`

A wrapper around `bunyan.error` to print (and send to jLocke if setup) only critical errors.

#### `log.debug(args) -> null`

Same for debugging.

### promise

Some promises related helpers.

- `promise` (object) - Including next points methods.

#### `promise.map()`

A wrapper around [`p-map`](https://github.com/sindresorhus/p-map).

#### `promise.mapSeries()`

A wrapper around [`p-map-series`](https://github.com/sindresorhus/p-map-series).

#### `promise.eachSeries()`

A wrapper around [`p-each-series`](https://github.com/sindresorhus/p-each-series).

### `sleep()`

A wrapper for [system-sleep](https://www.npmjs.com/package/system-sleep).

### `randomInt(min, max)`

Returns a random integer between min (inclusive) and max (inclusive).

- `min` (number) - Lower limit.
- `max` (number) - Higher limit.

### `requireDir(module)`

A wrapper for [node-require-directory](https://github.com/troygoode/node-require-directory).
