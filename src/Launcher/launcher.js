const { readFileSync } = require('node:fs');
const { basename, join, resolve } = require('node:path');
const { spawn } = require('node:child_process');
const { createProfile, authUser } = require('../Utils/auth.js');
const getJarFiles = require('../Utils/getJarFiles.js');
const argsResolver = require('../Utils/argsResolver.js');
const getVersion = require('../Utils/getVersion.js');
const getExtraLibs = require('../Utils/getExtraLibs.js');
const filterVersionLib = require('../Utils/filterVersionLib.js');

/**
 *
 * @param {Object} data Datos completos para jugar
 */
module.exports = async function launchMinecraft(data) {
  let { user, gameDirectory, version, type, java, usersConfig } = data;
  let customVersion = version;

  version = getVersion(version);

  createProfile(gameDirectory);

  const userData = JSON.stringify(user);
  usersConfig = resolve(usersConfig || join(gameDirectory, 'usercache.json'));
  user = authUser({ user: userData, config: usersConfig });

  let versionFile = readFileSync(
    resolve(gameDirectory, 'versions', `${version}`, `${version}.json`),
    {
      encoding: 'utf-8',
    }
  );
  versionFile = JSON.parse(versionFile);

  const libRoot = resolve(gameDirectory, 'libraries');
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

  let customFile;
  if (type !== 'release' && type !== 'snapshot') {
    customFile = readFileSync(
      resolve(gameDirectory, 'versions', `${customVersion}`, `${customVersion}.json`),
      {
        encoding: 'utf-8',
      }
    );
    customFile = JSON.parse(customFile);

    let customLibs;
    if (type === 'forge' || type === 'fabric' || type === 'optifine') {
      customLibs = customFile.libraries
        .filter((dependency) => dependency.name)
        .map((customLib) => {
          const parts = customLib.name.split(':');
          const [, name, version, api] = parts;

          if (api) {
            return `${name}-${version}-${api}.jar`;
          } else {
            return `${name}-${version}.jar`;
          }
        });
    } else if (type === 'neoforge') {
      customLibs = customFile.libraries
        .filter((dependency) => dependency.name)
        .map((customLib) => {
          const parts = customLib.name.split(':');
          const [, name, version, api] = parts;

          if (api) {
            return `${name}-${version}-${api.replace('@', '.')}`;
          } else {
            return `${name}-${version.replace('@', '.')}`;
          }
        });
    }

    libNecessary.push(...customLibs);
  }

  if (type === 'neoforge' || type === 'fabric') {
    libNecessary = filterVersionLib(libNecessary);
  }

  let { libraries, missingLibs } = await getJarFiles({
    root: libRoot,
    libNecessary: libNecessary,
  });

  if (missingLibs.length > 0) {
    const extraLibs = await getExtraLibs({ missingLibs, libRoot });
    libraries += extraLibs;
  }

  data = JSON.stringify(data);

  let args = argsResolver({
    user: user,
    libs: libraries,
    versionFile: versionFile,
    data: data,
    customFile: customFile,
  });

  const spawnRoot = resolve(gameDirectory);

  if (!java) {
    java = 'java';
  }

  console.log('Lanzando Minecraft version:', customVersion);
  console.log('Usando Java:', java);

  // console.log(args);

  const minecraft = spawn(java, args, { cwd: spawnRoot });
  minecraft.stdout.on('data', (data) => console.log('debug:', data.toString().trim()));
  minecraft.stderr.on('data', (data) => console.log('debug:', data.toString().trim()));
};
