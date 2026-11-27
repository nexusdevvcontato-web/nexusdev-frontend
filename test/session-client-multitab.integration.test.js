import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/auth/session-client.js', import.meta.url), 'utf8');

function createSharedBrowser({ refreshStatus = 200, logoutStatus = 204 } = {}) {
  let lockTail = Promise.resolve();
  const channels = new Set();
  const state = { cookie: '__Host-nexusdev_csrf=csrf-initial', refreshCalls: [], logoutCalls: 0 };
  class FakeBroadcastChannel {
    constructor(name) { this.name = name; this.listeners = new Set(); channels.add(this); }
    addEventListener(type, listener) { if (type === 'message') this.listeners.add(listener); }
    postMessage(data) {
      for (const channel of channels) {
        if (channel !== this && channel.name === this.name) {
          for (const listener of channel.listeners) listener({ data });
        }
      }
    }
  }
  const browser = {
    window: { location: { origin: 'https://app.example.test' } },
    document: {
      get cookie() { return state.cookie; },
      set cookie(value) {
        if (value.includes('Max-Age=0')) state.cookie = '';
        else state.cookie = value;
      }
    },
    navigator: {
      locks: {
        async request(_name, _options, callback) {
          const previous = lockTail;
          let release;
          lockTail = new Promise(resolve => { release = resolve; });
          await previous;
          try { return await callback(); } finally { release(); }
        }
      }
    },
    BroadcastChannel: FakeBroadcastChannel,
    fetch: async (url, options) => {
      if (String(url).includes('/api/auth/session/refresh')) {
        const csrf = new Headers(options.headers).get('X-CSRF-Token');
        state.refreshCalls.push(csrf);
        if (refreshStatus === 200) {
          const next = 'csrf-' + state.refreshCalls.length;
          state.cookie = '__Host-nexusdev_csrf=' + next;
        }
        return new Response(JSON.stringify(refreshStatus === 200
          ? { accessToken: 'access-' + state.refreshCalls.length }
          : { error: 'Sessão expirada.' }), {
          status: refreshStatus, headers: { 'Content-Type': 'application/json' }
        });
      }
      if (String(url).includes('/api/auth/session/logout')) {
        state.logoutCalls += 1;
        return new Response(null, { status: logoutStatus });
      }
      throw new Error('Unexpected fetch URL: ' + url);
    }
  };
  return { state, browser };
}

async function loadClient(browser) {
  const original = {
    window: globalThis.window, document: globalThis.document,
    navigator: globalThis.navigator, BroadcastChannel: globalThis.BroadcastChannel,
    fetch: globalThis.fetch
  };
  Object.assign(globalThis, browser);
  let code = source.replace(
    "import { resolveAuthenticatedApiUrl } from './request-url-policy.js';",
    "function resolveAuthenticatedApiUrl(input, { apiBaseUrl = '', origin } = {}) { const base = new URL(apiBaseUrl || origin, origin); const target = new URL(input, base); if (target.origin !== base.origin || !target.pathname.startsWith('/api/')) throw new TypeError('blocked'); return target.href; }"
  ).replace('import.meta.env.VITE_API_BASE_URL', "'https://api.example.test'");
  const module = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64') + '#' + Math.random());
  return {
    module,
    restore() {
      for (const key of Object.keys(original)) {
        if (original[key] === undefined) delete globalThis[key];
        else globalThis[key] = original[key];
      }
    }
  };
}

test('two tabs serialize refresh rotation and propagate confirmed logout', async () => {
  const { state, browser } = createSharedBrowser();
  const first = await loadClient(browser);
  const second = await loadClient(browser);
  try {
    const [firstToken, secondToken] = await Promise.all([
      first.module.refreshSession(), second.module.refreshSession()
    ]);
    assert.ok(firstToken);
    assert.ok(secondToken);
    assert.equal(state.refreshCalls.length, 2);
    assert.equal(state.refreshCalls[0], 'csrf-initial');
    assert.equal(state.refreshCalls[1], 'csrf-1',
      'the second tab must read the rotated CSRF cookie after acquiring the shared lock');

    const revoked = await first.module.logoutSession(firstToken);
    assert.equal(revoked, true);
    assert.equal(state.logoutCalls, 1);
    assert.equal(await second.module.refreshSession(), null,
      'a confirmed logout in one tab must prevent refresh in every other tab');
  } finally {
    first.restore();
    second.restore();
  }
});


test('a rejected refresh finalizes local logout and prevents repeated refresh attempts across tabs', async () => {
  const { state, browser } = createSharedBrowser({ refreshStatus: 401 });
  const first = await loadClient(browser);
  const second = await loadClient(browser);
  try {
    assert.equal(await first.module.refreshSession(), null);
    assert.equal(state.refreshCalls.length, 1);
    assert.equal(await first.module.refreshSession(), null,
      'the same tab must not retry a rejected refresh');
    assert.equal(await second.module.refreshSession(), null,
      'the logout broadcast must prevent refresh in other tabs');
    assert.equal(state.refreshCalls.length, 1,
      'a rejected session must not cause repeated network attempts');
    assert.equal(state.cookie, '',
      'local CSRF cookie must be cleared when refresh is rejected');
  } finally {
    first.restore();
    second.restore();
  }
});


test('a temporary refresh failure preserves local session state and applies a retry cooldown', async () => {
  const { state, browser } = createSharedBrowser({ refreshStatus: 503 });
  const client = await loadClient(browser);
  try {
    const originalCookie = state.cookie;
    await assert.rejects(
      client.module.refreshSession(),
      /Falha temporária ao renovar a sessão/
    );
    assert.equal(state.refreshCalls.length, 1);
    assert.equal(state.cookie, originalCookie,
      'a temporary server failure must not clear or rotate the CSRF cookie');
    assert.equal(client.module.getSessionAccessToken(), null);
    await assert.rejects(
      client.module.refreshSession(),
      /temporariamente em espera/
    );
    assert.equal(state.refreshCalls.length, 1,
      'the cooldown must prevent immediate repeated network attempts');
    assert.equal(state.cookie, originalCookie);
  } finally {
    client.restore();
  }
});


test('a failed logout clears local credentials and cannot silently renew without the CSRF cookie', async () => {
  const { state, browser } = createSharedBrowser({ refreshStatus: 401, logoutStatus: 503 });
  const client = await loadClient(browser);
  try {
    client.module.setSessionAccessToken('access-before-logout');
    const revoked = await client.module.logoutSession('access-before-logout');
    assert.equal(revoked, false,
      'a server error must never be reported as confirmed revocation');
    assert.equal(state.logoutCalls, 1);
    assert.equal(client.module.getSessionAccessToken(), null,
      'local access credentials must be cleared after the failed logout');
    assert.equal(state.cookie, '',
      'the CSRF cookie must be cleared so the browser cannot silently refresh the session');

    assert.equal(await client.module.refreshSession(), null,
      'the follow-up refresh must fail closed when the server did not confirm logout');
    assert.equal(state.refreshCalls.length, 1);
    assert.equal(state.refreshCalls[0], '',
      'the refresh request must not have a CSRF token after failed logout');
    assert.equal(client.module.getSessionAccessToken(), null);
  } finally {
    client.restore();
  }
});
