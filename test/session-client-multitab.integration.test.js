import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/auth/session-client.js', import.meta.url), 'utf8');

function createSharedBrowser() {
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
        const next = 'csrf-' + state.refreshCalls.length;
        state.cookie = '__Host-nexusdev_csrf=' + next;
        return new Response(JSON.stringify({ accessToken: 'access-' + state.refreshCalls.length }), {
          status: 200, headers: { 'Content-Type': 'application/json' }
        });
      }
      if (String(url).includes('/api/auth/session/logout')) {
        state.logoutCalls += 1;
        return new Response(null, { status: 204 });
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
