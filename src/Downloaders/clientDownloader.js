const download = require('../Utils/download.js');
const { resolve } = require('node:path');
const { existsSync, mkdirSync } = require('node:fs');

module.exports = async function clientDownloader({ root, version, client }) {
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
};
