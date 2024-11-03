import { versionDownloader } from '../Downloaders/versionsDownloader.js';
import { clientDownloader } from '../Downloaders/clientDownloader.js';
import { nativesDownloader } from '../Downloaders/nativesDownloader.js';
import { librariesDownloader } from '../Downloaders/librariesDownloader.js';
import { assetsDownloader } from '../Downloaders/assetsDownloader.js';

/**
 *
 * @param {string} root Directorio principal - './minecraft'
 * @param {string} version Version a Descargar - '1.16.5'
 * @param {string} version Tipo de Version a Descargar - 'release' o 'snapshot'
 */
export async function downloadMinecraft({ root, version, type }) {
  let data = { root: root, version: version, type: type };

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
}
