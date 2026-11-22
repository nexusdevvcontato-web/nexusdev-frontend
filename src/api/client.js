import { resolveAuthenticatedApiUrl } from '../auth/request-url-policy.js';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export function apiFetch(path, options = {}) {
  if (typeof path !== 'string' || !path.startsWith('/api/')) {
    throw new TypeError('Caminho de API inválido.');
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const safeUrl = resolveAuthenticatedApiUrl(path, {
    apiBaseUrl: API_BASE_URL,
    origin
  });

  return fetch(safeUrl, {
    ...options,
    credentials: 'include',
    cache: options.cache || 'no-store'
  });
}
