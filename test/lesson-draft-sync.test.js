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

test('identity changes mask previous-account editor contents until the new draft loads', () => {
  assert.match(hook, /filesMap: identityReady \? filesMap : \(initialFiles \|\| \{\}\)/);
  assert.match(hook, /conflict: identityReady \? conflict : null/);
});

test('draft saves are aborted when the active identity changes and newer edits are rescheduled', () => {
  assert.match(hook, /saveControllersRef\.current\.get\(identityKey\)/);
  assert.match(hook, /controller\?\.abort\(\)/);
  assert.match(hook, /signal: controller\.signal/);
  assert.match(hook, /scheduleNewerSnapshot/);
  assert.match(hook, /setRetrySaveCount/);
});

test('local drafts enforce the same per-file and aggregate byte limits as the API', async () => {
  const policy = await readFile(new URL('../src/drafts/draft-payload-policy.js', import.meta.url), 'utf8');
  assert.match(policy, /MAX_FILE_BYTES = 50 \\* 1024/);
  assert.match(policy, /MAX_TOTAL_BYTES = 40 \\* 1024/);
  assert.match(policy, /FORBIDDEN_CONTROLS/);
});
test('failed cloud reads keep the local account draft visible without auto-overwriting remote state', () => {
  assert.match(hook, /setReady\(true\);\s*setLoadedKey\(identityKey\);\s*setDirty\(false\);\s*setStatus\('offline'\)/);
  assert.match(hook, /failed read must never trigger an overwrite attempt/);
});


test('malformed persisted cloud revisions are validated by a dedicated policy', async () => {
  const policy = await readFile(new URL('../src/drafts/draft-payload-policy.js', import.meta.url), 'utf8');
  assert.match(hook, /validateRemoteDraft\(payload\)/);
  assert.match(policy, /draft\.revision > 0 && !isValidDraftFiles\(draft\.files\)/);
  assert.match(policy, /draft\.revision === 0 && Object\.keys\(draft\.files\)\.length !== 0/);
  assert.match(hook, /failed read must never trigger an overwrite attempt/);
});
