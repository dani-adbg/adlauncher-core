module.exports = function getVersion(version) {
  const versionPattern = /^(\d+\.\d+(?:\.\d+)?)/;
  const neoforgePattern = /^neoforge-(\d+\.\d+)/;

  const neoforgeMatch = version.match(neoforgePattern);
  if (neoforgeMatch) {
    return '1.' + neoforgeMatch[1];
  }

  const match = version.match(versionPattern);
  if (match) {
    return match[1];
  }

  return null;
};
