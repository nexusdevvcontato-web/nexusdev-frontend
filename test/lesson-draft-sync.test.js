import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const hook = await readFile(new URL('../src/drafts/useLessonDraftSync.js', import.meta.url), 'utf8');
const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');

test('cloud draft writes use optimistic revision checks and preserve conflicts', () => {
  assert.match(hook, /expectedRevision: revision/);
  assert.match(hook, /response\.status === 409/);
  assert.match(hook, /setConflict\(\{ localFiles: filesRef\.current, remoteDraft: payload\.draft \}\)/);
  assert.match(hook, /saveInFlightRef\.current\.has\(identityKey\)/);
});

test('account and lesson switches isolate asynchronous draft writes', () => {
  assert.match(hook, /loadedKey !== identityKey/);
  assert.match(hook, /activeIdentityRef\.current !== identityKey/);
  assert.match(hook, /saveInFlightRef\.current\.delete\(identityKey\)/);
});

test('the editor requires an explicit choice before resolving a draft conflict', () => {
  assert.match(app, /Usar versão da nuvem/);
  assert.match(app, /Manter versão deste dispositivo/);
  assert.match(app, /Nenhuma versão foi descartada/);
});
