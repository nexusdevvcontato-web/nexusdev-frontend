import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');

test('XP displayed for an authenticated account comes only from the API profile', () => {
  assert.match(source, /xp: Number\.isSafeInteger\(data\.xp\) && data\.xp >= 0 \? data\.xp : 0/);
  assert.match(source, /currentUser\.xp[\s\S]*?currentUser\.xp/);
  assert.doesNotMatch(source, /completedChallenges\.length\s*\*\s*50/);
});

test('local challenge completion is not presented as awarded server XP', () => {
  assert.match(source, /Concluída localmente/);
  assert.match(source, /Aula concluída neste dispositivo/);
  assert.match(source, /XP será liberado após validação segura/);
});
