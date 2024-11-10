const versionDownloader = require('../Downloaders/versionsDownloader.js');
const clientDownloader = require('../Downloaders/clientDownloader.js');
const nativesDownloader = require('../Downloaders/nativesDownloader.js');
const librariesDownloader = require('../Downloaders/librariesDownloader.js');
const assetsDownloader = require('../Downloaders/assetsDownloader.js');

/**
 *
 * @param {string} root Directorio principal - './minecraft'
 * @param {string} version Version a Descargar - '1.16.5'
 * @param {string} version Tipo de Version a Descargar - 'release' o 'snapshot'
 */
module.exports = async function downloadMinecraft({ root, version, type }) {
  let data = { root: root, version: version, type: type };

  console.log(`Empezando la descarga de Minecraft v${version}`);

  let versionData = JSON.parse(JSON.parse(await versionDownloader(data)));

  clientDownloader({
    ...data,
    client: versionData.downloads.client.url,
  });

  nativesDownloader({
    ...data,
    libraries: versionData.libraries,
  });

  librariesDownloader({
    ...data,
    libraries: versionData.libraries,
  });

  assetsDownloader({
    ...data,
    asset: versionData.assetIndex.url,
    totalSize: versionData.assetIndex.totalSize,
  });
};
