function filterVersionLib(libraries) {
  if (
    (libraries.includes('asm-9.3.jar') && libraries.includes('asm-9.7.jar')) ||
    (libraries.includes('asm-9.3.jar') && libraries.includes('asm-9.7.1.jar'))
  ) {
    let index = libraries.indexOf('asm-9.3.jar');

    libraries.splice(index, 1);
  }

  return libraries;
}

module.exports = filterVersionLib;
