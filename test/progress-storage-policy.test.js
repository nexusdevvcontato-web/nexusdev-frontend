import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStoredProgress } from '../src/storage/progress-storage-policy.js';

const valid = {
  completed: ['html-00-o-que-e-web', 'html-01-subtitulo-h2'],
  allowedChallengeIds: ['html-00-o-que-e-web', 'html-01-subtitulo-h2'],
  communityXp: 0,
  streak: { count: 3, todayCompleted: 1, lastActiveDate: '2026-11-20' }
};

test('accepts and deduplicates well-formed persisted progress', () => {
  const result = validateStoredProgress({ ...valid, completed: [...valid.completed, valid.completed[0]] });
  assert.deepEqual(result.completed, valid.completed);
  assert.equal(result.communityXp, 0);
  assert.deepEqual(result.streak, valid.streak);
});

test('rejects malformed progress instead of silently treating it as empty', () => {
  assert.throws(() => validateStoredProgress({ ...valid, completed: { lesson: true } }));
  assert.throws(() => validateStoredProgress({ ...valid, completed: ['ok', 7] }));
  assert.throws(() => validateStoredProgress({ ...valid, communityXp: Number.NaN }));
  assert.throws(() => validateStoredProgress({ ...valid, communityXp: -1 }));
  assert.throws(() => validateStoredProgress({ ...valid, streak: { count: -1, todayCompleted: 0, lastActiveDate: '2026-11-20' } }));
  assert.throws(() => validateStoredProgress({ ...valid, streak: { count: 1, todayCompleted: 0, lastActiveDate: 'yesterday' } }));
});


test('rejects completion IDs that are not part of the current curriculum', () => {
  assert.throws(() => validateStoredProgress({
    ...valid,
    completed: [...valid.completed, 'forged-lesson-id']
  }), /Progresso local inválido/);
});

test('supports older streak records without todayCompleted', () => {
  const result = validateStoredProgress({
    ...valid,
    streak: { count: 2, lastActiveDate: '2026-11-19' }
  });
  assert.equal(result.streak.todayCompleted, 0);
});
