const { resolve, sep, join } = require('node:path');
const { existsSync } = require('node:fs');
const filterObjArgs = require('./filterObjArgs.js');

module.exports = function argsResolver({ user, libs, versionFile, data, customFile }) {
  data = JSON.parse(data);

  const { name, uuid } = user;
  const { memory, gameDirectory, version } = data;
  let { mainClass, minecraftArguments, arguments, id, type } = versionFile;

  let gameArgs = minecraftArguments?.split(' ') || arguments?.game;

  const cVer = resolve(join(gameDirectory, 'versions', version, `${version}.jar`));
  libs += existsSync(cVer) ? resolve(cVer) : resolve(gameDirectory, 'versions', id, `${id}.jar`);

  let jvm = [
    `-Djava.library.path=${resolve(gameDirectory, 'natives', id)}`,
    `-Xmx${memory.max}`,
    `-Xms${memory.min}`,
    '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump',
  ];

  if (customFile != null) {
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

  jvm = filterObjArgs(jvm);
  gameArgs = filterObjArgs(gameArgs);

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
  };

  let args = [...jvm, '-cp', libs, mainClass, ...gameArgs];

  args = args.map((arg) => {
    return typeof arg === 'string'
      ? arg.replace(/\$\{[^}]+\}/g, (match) =>
          fields[match] !== undefined ? fields[match] : match
        )
      : arg;
  });
  return args;
};
