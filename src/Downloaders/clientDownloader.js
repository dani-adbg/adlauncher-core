import { download } from '../Utils/download.js';
import { resolve } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

export async function clientDownloader({ root, version, client }) {
  const dir = resolve(root, 'versions', version);

  try {
    console.log('Preparando cliente...');

    if (!existsSync(`${dir}/${version}.jar`)) {
      mkdirSync(dir, { recursive: true });

      download({
        url: client,
        dir: dir,
        name: `${version}.jar`,
      });
    }
  } catch (error) {
    console.error('Error al descargar cliente:\n', error);
    return;
  }
}
