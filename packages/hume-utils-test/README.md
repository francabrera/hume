# hume utils test

Some helpers shared among the tests.

## Install

:coffee: Install [Node.js](https://nodejs.org/download) v8 and then:

```sh
npm i @hume/utils-test
```

## Use

:pencil: You can visit the complete example [in this tests](./test).

```js
const utilsTest = require('@hume/utils-test');

console.log('Version');
console.log(utilsTst.version);
```

## API

:eyes: Full specification.

### `version`

The actual version of the library.

- `version` (string) - Version number.

### `shoot`

A wrapper for [snap-shot-it'](https://www.npmjs.com/package/snap-shot-it').

### `async throwsAsync(block, errRegex) -> null`

Am async version of [assert.throws](https://nodejs.org/api/assert.html#assert_assert_throws_block_error_message).

- `block` (function) - Piece of code (returning a promise) to be checked.
- `errRegex` (object) - Regular expresion to confirm the expected error.

### `request`

A wrapper for [supertest](https://github.com/chriso/supertest) with some additions (see next points).

### `async request.login(creds) -> res`

To login in Loopback using supertest in an easy way.

- `opts` (object) - An object with:
  - `email` (string) - Email of the user to create.
  - `password` (string) - Password of the user to create.

- `res` (object) - The response with.
  - `id` (string) - The new token.
