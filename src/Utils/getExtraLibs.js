const { resolve } = require('node:path');
const { existsSync, mkdirSync } = require('node:fs');
const download = require('./download.js');
const extraLibs = require('./extralibs.json');

async function getExtraLibs({ missingLibs, libRoot }) {
  let eLibs = '';

  const downloadPromises = missingLibs.map((lib) => {
    return new Promise((resolveDownload) => {
      let found = false;

      extraLibs.forEach(async (elib) => {
        if (elib.includes(lib)) {
          found = true;
          let directory = elib
            .replace('https://libraries.minecraft.net', libRoot)
            .replace(`/${lib}`, '');

          directory = resolve(directory);

          console.log(`No se ha encontrado librería ${lib}. Se ha empezado a descargar...`);
          if (!existsSync(directory)) mkdirSync(directory, { recursive: true });

          try {
            await download({ url: elib, dir: directory, name: lib });
            eLibs += `${directory}/${lib};`;
          } catch (error) {
            console.error(`Error en la descarga de ${lib}: ${error.message}`);
          } finally {
            resolveDownload();
          }
        }
      });

      if (!found) {
        console.error(`No se encontró la URL de la librería: ${lib} en extralibs.json`);
        resolveDownload();
      }
    });
  });

  await Promise.all(downloadPromises);
  return eLibs;
}

module.exports = getExtraLibs;
