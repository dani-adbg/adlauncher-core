import { resolve, sep } from 'node:path';

export function argsResolver({ user, libs, versionFile, data }) {
  data = JSON.parse(data);

  const { name, uuid } = user;
  const { memory, gameDirectory, version, type } = data;

  let mainClass = versionFile.mainClass;
  let gameArgs = versionFile.minecraftArguments?.split(' ') || versionFile.arguments?.game;

  libs += resolve(gameDirectory, 'versions', version, `${version}.jar`);

  let jvm = [
    `-Djava.library.path=${resolve(gameDirectory, 'natives', version)}`,
    `-Xmx${memory.max}`,
    `-Xms${memory.min}`,
    '-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump',
  ];

  const fields = {
    '${auth_access_token}': uuid,
    '${auth_session}': uuid,
    '${auth_player_name}': name,
    '${auth_uuid}': uuid,
    '${auth_xuid}': uuid,
    '${user_properties}': '{}',
    '${user_type}': 'mojang',
    '${version_name}': version,
    '${assets_index_name}': version,
    '${game_directory}': resolve(gameDirectory),
    '${assets_root}': resolve(gameDirectory, 'assets'),
    '${game_assets}': resolve(gameDirectory, 'assets'),
    '${version_type}': type,
    '${clientid}': uuid,
    '${resolution_width}': 856,
    '${resolution_height}': 482,
    '${library_directory}': resolve(gameDirectory, 'libraries').split(sep).join('/'),
    '${version_name}': version,
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
}
