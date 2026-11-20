const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const REFRESH_LOCK_NAME = 'nexusdev-session-refresh';
let accessToken = null;
let refreshInFlight = null;
const listeners = new Set();
let channel = null;

function notify(event) {
  for (const listener of listeners) {
    try { listener(event); } catch {}
  }
}

if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  channel = new BroadcastChannel('nexusdev-session-events');
  channel.addEventListener('message', (event) => {
    if (event.data?.type === 'logout') {
      accessToken = null;
      notify({ type: 'logout' });
    }
  });
}

export function setSessionAccessToken(token) {
  accessToken = typeof token === 'string' && token ? token : null;
  notify({ type: 'token', token: accessToken });
}

export function getSessionAccessToken() {
  return accessToken;
}

export function subscribeSessionEvents(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSessionCsrfToken() {
  if (typeof document === 'undefined') return '';
  const item = document.cookie.split(';').map(part => part.trim())
    .find(part => part.startsWith('__Host-nexusdev_csrf='));
  if (!item) return '';
  try { return decodeURIComponent(item.slice(item.indexOf('=') + 1)); } catch { return ''; }
}

async function performRefresh() {
  const csrfToken = getSessionCsrfToken();
  const response = await fetch(`${API_BASE_URL}/api/auth/session/refresh`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'X-CSRF-Token': csrfToken }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || typeof payload.accessToken !== 'string') {
    setSessionAccessToken(null);
    return null;
  }
  setSessionAccessToken(payload.accessToken);
  return payload.accessToken;
}

export function refreshSession() {
  if (refreshInFlight) return refreshInFlight;
  const run = async () => {
    if (typeof navigator === 'undefined' || !navigator.locks?.request) {
      throw new Error('Este navegador não oferece bloqueio entre abas para renovar a sessão com segurança.');
    }
    return navigator.locks.request(REFRESH_LOCK_NAME, { mode: 'exclusive' }, performRefresh);
  };
  refreshInFlight = run().finally(() => { refreshInFlight = null; });
  return refreshInFlight;
}

export async function authenticatedFetch(url, options = {}) {
  const send = (token) => {
    const headers = new Headers(options.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      cache: options.cache || 'no-store'
    });
  };

  let token = accessToken;
  if (!token) token = await refreshSession();
  if (!token) return send(null);

  let response = await send(token);
  if (response.status === 401 && !String(url).includes('/api/auth/session/refresh')) {
    token = await refreshSession();
    if (token) response = await send(token);
  }
  return response;
}

export function clearLocalCsrfCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = '__Host-nexusdev_csrf=; Max-Age=0; Path=/; Secure; SameSite=Lax';
}

export async function logoutSession(token) {
  let serverRevoked = false;
  try {
    const csrfToken = getSessionCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/auth/session/logout`, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token || accessToken || ''}`,
        'X-CSRF-Token': csrfToken
      }
    });
    serverRevoked = response.status === 204;
  } catch {
    serverRevoked = false;
  } finally {
    if (!serverRevoked) clearLocalCsrfCookie();
    setSessionAccessToken(null);
    try { channel?.postMessage({ type: 'logout' }); } catch {}
    notify({ type: 'logout' });
  }
  return serverRevoked;
}
