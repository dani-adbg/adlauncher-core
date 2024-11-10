const { existsSync, readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { randomUUID } = require('node:crypto');

function createProfile(root) {
  const dir = resolve(root, 'launcher_profiles.json');
  if (!existsSync(dir)) writeFileSync(dir, JSON.stringify({ profiles: {} }));
}

function authUser({ user, config }) {
  user = JSON.parse(user);

  if (!existsSync(config)) {
    writeFileSync(config, '[]', { encoding: 'utf-8' });
  }

  config = readFileSync(config, { encoding: 'utf-8' });
  config = JSON.parse(config);

  if (!user.username) return console.error('Introduce un usuario');
  if (!user.password) {
    const name = user.username;
    let userData, uuid;

    if (config.length === 0) {
      uuid = randomUUID();
      userData = { name: name, uuid: uuid };

      return (user = userData);
    } else {
      uuid = config.find((u) => u.name === user.username)
        ? config.find((u) => u.name === user.username).uuid
        : randomUUID();

      userData = { name: name, uuid: uuid };

      return (user = userData);
    }
  }
}

module.exports = { createProfile, authUser };
