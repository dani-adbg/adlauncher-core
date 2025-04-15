const { resolve, sep, join } = require('node:path');
const { existsSync } = require('node:fs');
const { filterGameArgs, filterJvmArgs } = require('./filterObjArgs.js');

module.exports = function argsResolver({ user, libs, versionFile, data, customFile }) {
  data = JSON.parse(data);

  const { name, uuid } = user;
  const { memory, gameDirectory, version } = data;
  let { mainClass, minecraftArguments, arguments, id, type } = versionFile;

  let gameArgs = minecraftArguments?.split(' ') || arguments?.game;

  let cVer = resolve(join(gameDirectory, 'versions', version, `${version}.jar`));
  libs += existsSync(cVer) ? resolve(cVer) : resolve(gameDirectory, 'versions', id, `${id}.jar`);

  let jvm = [
    `-Xmx${memory.max}`,
    `-Xms${memory.min}`,
    arguments?.jvm || [`-Djava.library.path=${resolve(gameDirectory, 'natives', id)}`, '-cp', libs],
  ];

  if (customFile.mainClass != versionFile.mainClass) {
    mainClass = customFile.mainClass;

    if (!minecraftArguments) {
      gameArgs.push(...customFile.arguments.game);
      if (customFile.arguments.jvm) {
        jvm.push(...customFile.arguments.jvm);
      }
    } else {
      gameArgs = customFile.minecraftArguments.split(' ');
    }
  }

  jvm = filterJvmArgs(jvm);
  gameArgs = filterGameArgs(gameArgs);

  const fields = {
    '${auth_access_token}': uuid,
    '${auth_session}': uuid,
    '${auth_player_name}': name,
    '${auth_uuid}': uuid,
    '${auth_xuid}': uuid,
    '${user_properties}': '{}',
    '${user_type}': 'mojang',
    '${version_name}': id,
    '${assets_index_name}': id,
    '${game_directory}': resolve(gameDirectory),
    '${assets_root}': resolve(gameDirectory, 'assets'),
    '${game_assets}': resolve(gameDirectory, 'assets'),
    '${version_type}': type,
    '${clientid}': uuid,
    '${resolution_width}': 856,
    '${resolution_height}': 482,
    '${library_directory}': resolve(gameDirectory, 'libraries').split(sep).join('/'),
    '${classpath_separator}': ';',
    '${natives_directory}': resolve(gameDirectory, 'natives', id),
    '${classpath}': [libs],
    '${launcher_name}': 'adlauncher-core',
    '${launcher_version}': 'v1.0',
  };

  let args = [...jvm, mainClass, ...gameArgs];

  args = args.map((arg) => {
    return typeof arg === 'string'
      ? arg.replace(/\$\{[^}]+\}/g, (match) =>
          fields[match] !== undefined ? fields[match] : match
        )
      : arg;
  });

  return args;
};
