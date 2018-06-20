# hume WS app

Websockets service application abstraction to decrease the load in the HTTP APIs for common read only requests.

For now it keeps an updated cache in memory of the needed data. All the connected clients will receive an update of the requested one in an interval.

## Install

:coffee: Install [Node.js](https://nodejs.org/download) v8 and then:

```sh
npm i @hume/app-ws
```

### Dependencies

- Install the [dependencies](https://github.com/uNetworking/bindings/tree/master/nodejs#installation) for the websockets library from your OS package manager.

## Use

:pencil: Please visit the [the example](../../example/ws.js).

### Client side

Two query parameters are supported:

- `token` (string) - Mandatory, see the last point of this document.
- `filter` (string) - To serve only the the contend under one key of the cache. (default: null)

Please visit [the example](../../example/ws.html).

## API

:eyes: Full specification.

### `app.start(serviceName, cache, token) -> null`

Start the LoopBack app.

- `serviceName` (string) - Microservice identifier, for logging, monitoring, etc.
- `cache` (async function) - Method to get the data to serve.
- `token` (string) - For now we only need basic auth to avoid automated scrappers. If not passed auth is disabled. (default: null)

### `async app.stop() -> null`

Stop the websocket service, useful in tests.
