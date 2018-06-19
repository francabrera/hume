/**
 * @license
 *
 * Copyright (c) 2018, IBM.
 *
 * This source code is licensed under the Apache License, Version 2.0 found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

'use strict';

// We can't use the debug object from utils here to avoir a circular dep.
const Logger = require('./Logger');
const projectName = require('../package.json').name;

const dbg = new Logger(projectName).debug;

module.exports.getUserId = async req => {
  const { app } = req;

  const { AccessToken } = app.models;
  const token = req.query.access_token || req.headers.Authorization;

  if (!token) {
    throw new Error('Token not found');
  }

  const result = await AccessToken.findById(token);

  if (!result || !result.userId) {
    return null;
  }

  return result.userId;
};

// User and roles to create is no one exists.
const defaultUser = {
  username: 'admin',
  password: 'admin',
  email: 'admin@myapp.mybluemix.net',
};
// "admin" not used for now, but eventually we're going to need it.
const defaultRoles = ['frontend', 'admin'];

module.exports.createUser = async (app, opts = {}) => {
  const { User, Role, RoleMapping } = app.models;

  // Parsing the options.
  if (opts.username) {
    defaultUser.username = opts.username;
  }
  if (opts.password) {
    defaultUser.password = opts.password;
  }
  if (opts.email) {
    defaultUser.email = opts.email;
  }

  dbg('Checking if I need to do any users/roles related tasks...');
  // We can do it in parallel with the last one.
  // Only first run in a new database, we rely in if any user exists to know it.
  let users;
  try {
    users = await User.find();
  } catch (err) {
    throw new Error(`Checking if any user exist: ${err.message}`);
  }

  dbg(`Number of users: ${users.length}`);

  if (users && users.length && users.length > 0) {
    dbg('Not in first run, so doing nothing');

    return;
  }

  dbg('First app run, creating default user ...');
  let user;
  try {
    user = await User.create(defaultUser);
  } catch (err) {
    throw new Error(`Creating the default user: ${err.message}`);
  }

  dbg('User created', user);

  if (!user) {
    throw new Error('User not created properly');
  }

  dbg('Creating roles ...');
  let roles;
  try {
    roles = await Promise.map(defaultRoles, roleName =>
      Role.create({ name: roleName }),
    );
  } catch (err) {
    throw new Error(`Creating roles: ${err.message}`);
  }
  const frontRole = roles[0];

  dbg('Roles created', defaultRoles);
  dbg('Adding user to the Frontend role ...');

  try {
    await frontRole.principals.create({
      principalType: RoleMapping.USER,
      principalId: user.id,
    });
  } catch (err) {
    throw new Error(`Adding the user to the role: ${err.message}`);
  }
};
