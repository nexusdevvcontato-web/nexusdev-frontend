export function extractPasswordResetLocation({ pathname = '/', search = '', hash = '' } = {}) {
  const queryParams = new URLSearchParams(String(search).replace(/^\\?/, ''));
  const fragmentParams = new URLSearchParams(String(hash).replace(/^#/, ''));
  const token = fragmentParams.get('passwordResetToken') || '';

  // Reset credentials are accepted only from the URL fragment. Remove legacy
  // query-string copies as well so they cannot remain in the visible URL.
  queryParams.delete('passwordResetToken');
  fragmentParams.delete('passwordResetToken');

  const query = queryParams.toString();
  const fragment = fragmentParams.toString();
  return {
    token,
    cleanedUrl: String(pathname || '/') + (query ? `?${query}` : '') + (fragment ? `#${fragment}` : '')
  };
}
