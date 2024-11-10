function filterObjArgs(array) {
  return array.flatMap((item) => {
    if (typeof item === 'object') {
      const values = Array.isArray(item.values)
        ? item.values
        : Array.isArray(item.value)
        ? item.value
        : [];

      return values.filter((val) => !val.includes('quick') && val !== '--demo');
    }
    return item;
  });
}

module.exports = filterObjArgs;
