import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');

test('curriculum builder includes explicitly authored additional lessons', () => {
  assert.match(
    source,
    /const list = \[\.\.\.mod\.challenges, \.\.\.\(Array\.isArray\(mod\.additionalChallenges\) \? mod\.additionalChallenges : \[\]\)\];/
  );
  assert.match(source, /let idx = list\.length \+ 1;/);
  assert.match(source, /while \(list\.length < TARGET_PER_MODULE\)/);
});

test('authored React, Express and database lessons remain part of the 140-lesson modules', () => {
  for (const id of [
    'mod-3-aula-2', 'mod-3-aula-3', 'mod-3-aula-4',
    'mod-4-aula-2', 'mod-4-aula-3', 'mod-4-aula-4',
    'mod-5-aula-2', 'mod-5-aula-3', 'mod-5-aula-4',
    'mod-5-aula-5', 'mod-5-aula-6', 'mod-5-aula-7'
  ]) {
    assert.ok(source.includes(`id: '${id}'`), id);
  }
});
