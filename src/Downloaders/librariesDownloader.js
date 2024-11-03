import { download } from '../Utils/download.js';
import { basename, dirname, resolve } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

export async function librariesDownloader({ root, libraries }) {
  libraries = libraries
    .filter((lib) => lib.downloads.artifact)
    .map((lib) => {
      const { url, path } = lib.downloads.artifact;
      return {
        url: url,
        path: dirname(path),
        name: basename(path),
      };
    });

  try {
    console.log('Instalando librerias...');
    libraries.forEach((lib) => {
      let libPath = resolve(root, 'libraries', lib.path);

      if (!existsSync(libPath)) mkdirSync(libPath, { recursive: true });

      download({ url: lib.url, dir: libPath, name: lib.name });
    });
  } catch (error) {
    console.error('Error al descargar archivo nativo:\n', error);
    return;
  }
}
