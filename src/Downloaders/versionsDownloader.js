const download = require('../Utils/download.js');
const { resolve } = require('node:path');
const { existsSync, mkdirSync, readFileSync } = require('node:fs');

module.exports = async function versionDownloader({ root, version, type }) {
  const versionsDir = resolve(root, 'cache', 'json');

  try {
    if (!existsSync(`${versionsDir}/version_manifest.json`)) {
      mkdirSync(versionsDir, { recursive: true });

      await download({
        url: 'https://launchermeta.mojang.com/mc/game/version_manifest.json',
        dir: versionsDir,
        name: 'version_manifest.json',
      });
    }
  } catch (error) {
    console.error('Error al descargar version_manifest:\n', error);
    return;
  }

  let versionData;
  try {
    console.log('Preparando archivo de versiones...');

    const { versions } = JSON.parse(
      readFileSync(`${versionsDir}/version_manifest.json`, { encoding: 'utf-8' })
    );

    const versionDir = resolve(root, 'versions', version);

    if (!existsSync(`${versionDir}/${version}.json`)) {
      mkdirSync(versionDir, { recursive: true });

      const { url } = versions.find((v) => v.type === type && v.id === version);

      await download({
        url: url,
        dir: versionDir,
        name: `${version}.json`,
      });
    }
    versionData = JSON.stringify(
      readFileSync(`${resolve(root, 'versions', version)}/${version}.json`, { encoding: 'utf-8' })
    );

    return versionData;
  } catch (error) {
    console.error(`Error al descargar metadata de la version ${version}\n`, error);
  }
};
