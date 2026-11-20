import { resolveAuthenticatedApiUrl } from './request-url-policy.js';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const REFRESH_LOCK_NAME = 'nexusdev-session-refresh';
let accessToken = null;
let refreshInFlight = null;
let sessionEpoch = 0;
let logoutInProgress = false;
const listeners = new Set();
let channel = null;

function sessionApiUrl(path) {
  return resolveAuthenticatedApiUrl(path, {
    apiBaseUrl: API_BASE_URL,
    origin: typeof window !== 'undefined' ? window.location.origin : ''
  });
}

function notify(event) {
  for (const listener of listeners) {
    try { listener(event); } catch {}
  }
}

if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  channel = new BroadcastChannel('nexusdev-session-events');
  channel.addEventListener('message', (event) => {
    if (event.data?.type === 'logout') {
      sessionEpoch += 1;
      logoutInProgress = true;
      accessToken = null;
      notify({ type: 'logout' });
    }
  });
}

export function setSessionAccessToken(token) {
  accessToken = typeof token === 'string' && token ? token : null;
  if (accessToken) logoutInProgress = false;
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
  if (logoutInProgress) return null;
  const refreshEpoch = sessionEpoch;
  const csrfToken = getSessionCsrfToken();
  const response = await fetch(sessionApiUrl('/api/auth/session/refresh'), {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'X-CSRF-Token': csrfToken }
  });
  const payload = await response.json().catch(() => ({}));
  if (refreshEpoch !== sessionEpoch || logoutInProgress) return null;
  if (!response.ok || typeof payload.accessToken !== 'string') {
    setSessionAccessToken(null);
    return null;
  }
  setSessionAccessToken(payload.accessToken);
  return payload.accessToken;
}

export function refreshSession() {
  if (logoutInProgress) return Promise.resolve(null);
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
  const safeUrl = resolveAuthenticatedApiUrl(url, {
    apiBaseUrl: API_BASE_URL,
    origin: typeof window !== 'undefined' ? window.location.origin : ''
  });
  const send = (token) => {
    const headers = new Headers(options.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(safeUrl, {
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

// Call only after the server has confirmed global session revocation.
// Keep this tab locked against refresh and notify every other open tab.
export function finalizeSessionLogout() {
  logoutInProgress = true;
  sessionEpoch += 1;
  accessToken = null;
  clearLocalCsrfCookie();
  try { channel?.postMessage({ type: 'logout' }); } catch {}
  notify({ type: 'logout' });
}

export async function logoutSession(token) {
  logoutInProgress = true;
  sessionEpoch += 1;
  let serverRevoked = false;
  try {
    const csrfToken = getSessionCsrfToken();
    const response = await fetch(sessionApiUrl('/api/auth/session/logout'), {
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
    logoutInProgress = false;
  }
  return serverRevoked;
}
