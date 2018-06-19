/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

module.exports = server => {
  server.models.cat.create([
    { name: 'garfield', angry: false },
    { name: 'baguira' },
  // eslint-disable-next-line no-console
  ]).then(() => console.log('Model "cat" populated'));

  server.models.dog.create({ name: 'lucas' })
    // eslint-disable-next-line no-console
    .then(() => console.log('Model "dog" populated'));
};
