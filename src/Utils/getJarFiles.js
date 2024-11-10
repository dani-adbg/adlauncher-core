const { readdirSync, statSync } = require('node:fs');
const { basename, join } = require('node:path');

let files,
  missingLibs = [],
  missing = true;

module.exports = function getJarFiles({ root, libNecessary }) {
  let libraries = '';
  files = readdirSync(root);
  if (missing) {
    missingLibs.push(...libNecessary);
    missing = false;
  }

  files.forEach((file) => {
    const pathFile = join(root, file);
    if (statSync(pathFile).isDirectory()) {
      libraries += getJarFiles({ root: pathFile, libNecessary }).libraries;
    } else {
      if (libNecessary.includes(basename(pathFile))) {
        libraries += pathFile + ';';
        let index = missingLibs.indexOf(file);

        while (index !== -1) {
          missingLibs.splice(index, 1);
          index = missingLibs.indexOf(file);
        }
      }
    }
  });

  return { libraries, missingLibs };
};
