# hume utils

Some helpers shared among the rest of the packages.

## Install

:coffee: Install [Node.js](https://nodejs.org/download) v8 and then:

```sh
npm i @hume/utils
```

## Use

:pencil: You can visit the complete example [in this tests](./test).

```js
const utils = require('@hume/utils');

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

### `async error(msg, error, opts) -> id`

To report errors to logger and APM (if enabled).

- `msg` (string) - Custom message explaining the error.
- `error` (Error) - JavaScript error.
- `opts` (object) - Optional parameters:
  - `userId` (string) - The user ID generating the error. If you want to track also the user in the APM (default: null)
  - `custom` (object) - some arbitrary details (default: {})

### `async lb.getUserId(req) -> id`

To get the user ID in LoopBack from a request object. To use outside HTTP APIs, there LoopBack has its own mechanism, use next point method instead.

- `req` (object) - A Loopback "request" object.
- `id` (string) - The user identifierm `null` if not found.

### `async lb.addUserId(model) -> null`

To add the current user ID to the actual model when present. Thought to be used in the models with endpoints that need it. So, thanks to [this LoopBack mechanism](https://loopback.io/doc/en/lb3/Using-current-context.html#override-createoptionsfromremotingcontext-in-your-model) we have the field "currentUserId" once this is called.

- `model` (object) - A Loopback "Model" object.

### `async lb.createUser(app, opts) -> null`

To create a first user and the proper roles.

- `app` (object) - A Loopback "app" object.
- `opts` (object) - An object with:
  - `username` (string) - Username of the user to create. (default: 'admin')
  - `password` (string) - Password of the user to create. (default: 'admin')
  - `email` (string) - Email of the user to create. (default: 'admin@admin@myapp.mybluemix.net')

### logger(name) -> log

A wrapper around [Pino](https://github.com/pinojs/pino) (with [prettystream](https://github.com/pinojs/pino-pretty)), but only the next 3 [levels](https://github.com/pinojs/pino/blob/master/docs/API.md#level) are allowed.

- `name` (string) - Project name to tag the messages. (default: 'app')
- `log` (object) - Including next points methods.

#### `log.error(msg, err, data)-> null`

Function used to register errors in log. It acts as adapter of the function `pino.error`. 

- `msg` (string) - A message with the explanation
- `err` (object) - An error to register in the log
- `data` (object) - An object with additional data to include in error log entry

#### `log.info(msg, data) -> null`

Function used to log debug messages. It acts as adapter of the function `pino.info` signature.Keep it to the minimal, because it's also printed in production and `console.*` methods are sync operations.

- `msg` (string) - A message with the explanation
- `data` (object) - An object with additional data to include in info log entry

#### `log.debug(msg, data) -> null`

Function used to log debug messages. It acts as adapter of the function `pino.debug` signature.

- `msg` (string) - A message with the explanation
- `data` (object) - An object with additional data to include in debug log entry

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
