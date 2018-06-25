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
- `opts` ({}) - Optional parameters. (default: {})
  - `auth` (boolean) - To fisable authentication. (default: false)
  - `noHttp` (boolean) - To re-use only the LoopBack models. The Redis cache is disabled and the HTTP server is not started. (default: false)
  - `cache` ({}) - Model caching options, disabled if `noHttp` enabled:
    - `disabled` (boolean) - To disable it. (default: false)
    - `methods` ({}) - Methods to cache. The keys represent the model name and the value is a string of arrays with the method names, ie: `{ cat: ["find"] }`. (default: {})
  - `explorer` ({}) - Explorer options, disabled if `noHttp` enabled:
    - `disabled` (boolean) - To hide it. (default: false)
    - `title` (string) - To show as title of the site. (default: "IBM Q")
    - `description` (string) - To show as title of the site. (default: "HTTP API specification.")
    - `mountPath` (string) - The endpoint where it's exposed. (default: '/explorer')
    - `version` (string) - To overwrite this package version.
    - `termsOfService` (string) - URL poiting to the terms of this service. (default: 'TODO')
  - `apm` ({}) - Elastic APM [express.js agent](https://www.elastic.co/guide/en/apm/agent/nodejs/current/express.html) instance (already started).
  - `firewall` ({}) - Firewall options, disabled if `noHttp` enabled:
    - `disabled` (boolean) - To disable it. (default: false)
    - `detectOnly` (boolean) - Do not block the offender's origin, only detect it. (default: false)
    - `breathe` (number) - Time to free the memory, to avoid a huge memory fingerprint. All the IPs and users will be unblocked. In minutes, use 0 to disable. (default: 6 hours)
    - `tor` (boolean) - To detect tor exit nodes. (default: true)
    - `tagId` (string) - The field of the `req` object containing the user identifier. If it can't be found related controls are disabled. (default: "userId")
    - `whitelist` ({}) - To block any request excepting the one from the defined origins.
    - `ips` ([string]) - IP addresses.
    - `users` ([string]) - User identifiers.
    - `admins` (boolean/{}) - To whithelist the system adimistrators. (default: false)
      - `tag` (string) - The field of the `req` object containing a boolean meaning this user is an administrator. If it can't be found related controls are disabled. (default: "isAdmin")
    - `blacklist` ({}) - To block any request from defined origins.
      - `ips`
      - `user`
      - `custom`
    - `ratelimit` (boolean/{}) - To avoid huge loads. (default: true)
      - `ip` (boolean/{}) - By IP address.
        - `total` (number) - Number of requests over timespan. (default: 10)
        - `interval` (number) - Time bucket (in seconds) (default: 60)
      - `ipPort` (boolean/{}) - By IP address/port.
        - `total` (number) - (default: 20)
        - `interval` (number) - (default: 60)
      - `user` (boolean/{}) - By user identifiers.
        - `total` (default: 50)
        - `interval` (default: 60)
    - `crafted` (boolean/{}) - To block requests with malicious content. Be carefull with this, RegExp are performance killers. (default: false) (still not implemented)

NOTE: If a model is "public" in this app it takes precedence over the another app using it. You have to put the one here to "false" and the other to "true" to make it public. It can seem a bit messy but it's a good thing because it allows to reuse also the "sharedMethods" definiton.

### `app.stop() -> null`

Stop the LoopBack app, useful in tests.
