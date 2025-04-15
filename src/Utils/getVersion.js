const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

module.exports = function getVersion(version, gameDirectory) {
  const customVersionFile = JSON.parse(
    readFileSync(resolve(gameDirectory, 'versions', `${version}`, `${version}.json`), {
      encoding: 'utf-8',
    })
  );

  let vanillaVersion = customVersionFile.inheritsFrom || customVersionFile.id;

  let vanillaVersionFile = JSON.parse(
    readFileSync(
      resolve(gameDirectory, 'versions', `${vanillaVersion}`, `${vanillaVersion}.json`),
      {
        encoding: 'utf-8',
      }
    )
  );

  return [vanillaVersionFile, customVersionFile];
};
