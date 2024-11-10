module.exports = function getVersion(version) {
  const versionPattern = /(\d+\.\d+)(?:\.|$)/;
  const match = version.match(versionPattern);

  if (!match) return null;

  version = match[1];

  if (version.startsWith('21.')) {
    version = '1.' + version;
  }

  return version;
};
