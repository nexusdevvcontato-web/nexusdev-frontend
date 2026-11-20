export function isStorageIdentityReady(activePrefix, loadedPrefix) {
  return typeof activePrefix === 'string' && activePrefix.length > 0 && activePrefix === loadedPrefix;
}
