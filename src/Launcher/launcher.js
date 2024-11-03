import { readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { createProfile, authUser } from '../Utils/auth.js';
import { getJarFiles } from '../Utils/getJarFiles.js';
import { argsResolver } from '../Utils/argsResolver.js';

/**
 *
 * @param {Object} data Datos completos para jugar
 */
export async function launchMinecraft(data) {
  let { user, gameDirectory, version, type, java, usersConfig } = data;

  createProfile(gameDirectory);

  const userData = JSON.stringify(user);
  usersConfig = resolve(usersConfig || join(gameDirectory, 'usercache.json'));
  user = authUser({ user: userData, config: usersConfig });

  const libRoot = resolve(gameDirectory, 'libraries');

  let versionFile = readFileSync(
    resolve(gameDirectory, 'versions', `${version}`, `${version}.json`),
    {
      encoding: 'utf-8',
    }
  );
  versionFile = JSON.parse(versionFile);

  let libNecessary = versionFile.libraries
    .filter(
      (lib) =>
        lib.downloads.artifact &&
        (!lib.rules ||
          lib.rules.every(
            (rule) => rule.action === 'allow' && rule.os && rule.os.name === 'windows'
          ) ||
          lib.rules.some((rule) => rule.action === 'disallow' && rule.os && rule.os.name === 'osx'))
    )
    .map((lib) => basename(lib.downloads.artifact.path));

  const libraries = getJarFiles({
    root: libRoot,
    version: version,
    type: type,
    libNecessary: libNecessary,
  });

  data = JSON.stringify(data);

  let args = argsResolver({ user: user, libs: libraries, versionFile: versionFile, data: data });

  const spawnRoot = resolve(gameDirectory);

  if (!java) {
    java = 'java';
  }

  console.log(args);
  const minecraft = spawn(java, args, { cwd: spawnRoot });
  minecraft.stdout.on('data', (data) => console.log('debug:', data.toString().trim()));
  minecraft.stderr.on('data', (data) => console.log('debug:', data.toString().trim()));
}
