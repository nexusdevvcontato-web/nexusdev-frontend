export function resolveAuthenticatedApiUrl(input, { apiBaseUrl = '', origin } = {}) {
  if (typeof input !== 'string' || !input.trim() ||
      typeof origin !== 'string' || !origin.trim()) {
    throw new TypeError('A URL de API autenticada é inválida.');
  }

  let apiBase;
  let target;
  try {
    apiBase = new URL(apiBaseUrl || origin, origin);
    target = new URL(input, apiBase);
  } catch {
    throw new TypeError('A URL de API autenticada é inválida.');
  }

  if (!['http:', 'https:'].includes(apiBase.protocol) ||
      apiBase.username || apiBase.password ||
      target.origin !== apiBase.origin ||
      !target.pathname.startsWith('/api/') ||
      target.username || target.password) {
    throw new TypeError('Requisições autenticadas só podem acessar a API configurada.');
  }

  return target.href;
}
