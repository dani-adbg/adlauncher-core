import { download } from '../Utils/download.js';
import { basename, resolve } from 'node:path';
import { existsSync, mkdirSync, unlinkSync } from 'node:fs';
import Zip from 'adm-zip';

export async function nativesDownloader({ root, version, libraries }) {
  const dir = resolve(root, 'natives');
  const natives = libraries
    .filter(
      (lib) =>
        lib.downloads.classifiers &&
        lib.downloads.classifiers['natives-windows' || 'natives-windows-64']
    )
    .map((nat) => {
      const { url, path } = nat.downloads.classifiers['natives-windows' || 'natives-windows-64'];
      return {
        url: url,
        path: basename(path),
      };
    });

  try {
    console.log('Preparando archivos nativos...');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    natives.forEach((native) => {
      if (version === '1.8' && native.url.includes('nightly')) return;

      download({ url: native.url, dir: dir, name: native.path })
        .then(() => {
          new Zip(resolve(dir, native.path)).extractAllToAsync(resolve(dir, version), true);
        })
        .then(() => unlinkSync(resolve(dir, native.path)));
    });
  } catch (error) {
    console.error('Error al descargar archivo nativo:\n', error);
    return;
  }
}
