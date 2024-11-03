import { readdirSync, statSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';

let files;

export function getJarFiles({ root, libNecessary, version }) {
  let jarFiles = '';
  files = readdirSync(root);

  files.forEach((file) => {
    const pathFile = join(root, file);
    if (statSync(pathFile).isDirectory()) {
      jarFiles += getJarFiles({ root: pathFile, libNecessary, version });
    } else {
      if (libNecessary.includes(basename(pathFile))) {
        jarFiles += pathFile + ';';
      }
    }
  });

  return jarFiles;
}
