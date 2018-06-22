# hume HTTP app

LoopBack (HTTP API) appplication abstraction to reuse in the services.

## Install

:coffee: Install [Node.js](https://nodejs.org/download) v8 and then:

```sh
npm i @hume/app
```

## Use

:pencil: Include you LoopBack custom setup files (`model-config.json`, `datasources.json`, etc.) in the same folder al require it . Please visit the [api-research](../services/api-research) implementation.

```js
const app = require('@hume/app');

app.start(__dirname);
```

## API

:eyes: Full specification.

### `app.start(path, opts) -> null`

Start the LoopBack app.

- `path` (string) - Path to the app sources. To bootstrap (configure models, datasources and middleware) the app with some different setup than `hume-app` the one. Probably you should pass `__dirname` here.
- `opts` (object) - Optional parameters. (default: {})
  - `auth` (boolean) - To fisable authentication. (default: false)
  - `noHttp` (boolean) - To re-use only the LoopBack models. The Redis cache is disabled and the HTTP server is not started. (default: false)
  - `cache` (object) - Model caching options, disabled if `noHttp` enabled:
    - `disabled` (boolean) - To disable it. (default: false)
    - `methods` (object) - Methods to cache. The keys represent the model name and the value is a string of arrays with the method names, ie: `{ cat: ["find"] }`. (default: {})
  - `explorer` (object) - Explorer options, disabled if `noHttp` enabled:
    - `disabled` (boolean) - To hide it. (default: false)
    - `title` (string) - To show as title of the site. (default: "IBM Q")
    - `description` (string) - To show as title of the site. (default: "HTTP API specification.")
    - `mountPath` (string) - The endpoint where it's exposed. (default: '/explorer')
    - `version` (string) - To overwrite this package version.
    - `termsOfService` (string) - URL poiting to the terms of this service. (default: 'TODO')
  - `apm` (object) - Elastic APM [express.js agent](https://www.elastic.co/guide/en/apm/agent/nodejs/current/express.html) instance (already started).

NOTE: If a model is "public" in this app it takes precedence over the another app using it. You have to put the one here to "false" and the other to "true" to make it public. It can seem a bit messy but it's a good thing because it allows to reuse also the "sharedMethods" definiton.

### `app.stop() -> null`

Stop the LoopBack app, useful in tests.
