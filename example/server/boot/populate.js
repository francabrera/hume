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
