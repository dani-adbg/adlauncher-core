function filterGameArgs(array) {
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

function filterJvmArgs(array) {
  return array.flat().reduce((acc, element) => {
    if (
      typeof element === 'object' &&
      element.rules?.[0]?.action === 'allow' &&
      element.rules[0].os.name === 'windows'
    ) {
      acc.push(element.value);
    } else if (typeof element === 'string') {
      acc.push(element);
    }
    return acc;
  }, []);
}

module.exports = {
  filterGameArgs,
  filterJvmArgs,
};
