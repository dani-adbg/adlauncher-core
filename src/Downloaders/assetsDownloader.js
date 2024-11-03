import { download } from '../Utils/download.js';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

export async function assetsDownloader({ root, version, asset, totalSize }) {
  const dir = resolve(root, 'assets');
  const indexAssets = join(dir, 'indexes');

  if (!existsSync(indexAssets)) mkdirSync(indexAssets, { recursive: true });

  try {
    console.log('Descargando recursos...');
    await download({ url: asset, dir: indexAssets, name: `${version}.json` });
    await download({
      url: asset,
      dir: resolve(root, 'cache', 'json'),
      name: `${version}.json`,
    });
  } catch (error) {
    console.error('Error al descargar index de assets\n', error);
  }

  let size = 0,
    percentage;

  try {
    let { objects } = JSON.parse(
      readFileSync(resolve(indexAssets, `${version}.json`), { encoding: 'utf-8' })
    );

    objects = Object.values(objects);

    objects.forEach((obj) => {
      const fileSize = obj.size;
      const fileHash = obj.hash;
      const fileSubHash = fileHash.substring(0, 2);

      const filePath = join(dir, 'objects', fileSubHash);

      if (!existsSync(filePath)) mkdirSync(filePath, { recursive: true });

      download({
        url: `https://resources.download.minecraft.net/${fileSubHash}/${fileHash}`,
        dir: filePath,
        name: fileHash,
      }).then(() => {
        size += fileSize;
        percentage = Math.floor((size / totalSize) * 100);
        const progress = Math.floor((size / totalSize) * 40);
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(
          `Descargando: [${'='.repeat(progress)}${' '.repeat(40 - progress)}] ${percentage}%`
        );
      });
    });
  } catch (error) {
    console.error('Error al descargar archivo\n', error);
  }
}
