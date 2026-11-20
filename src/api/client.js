export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export function apiFetch(path, options = {}) {
  if (typeof path !== 'string' || !path.startsWith('/api/')) {
    throw new TypeError('Caminho de API inválido.');
  }

  return fetch(API_BASE_URL + path, {
    ...options,
    credentials: 'include',
    cache: options.cache || 'no-store'
  });
}
