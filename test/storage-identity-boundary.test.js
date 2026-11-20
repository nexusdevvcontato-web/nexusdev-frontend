import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { isStorageIdentityReady } from '../src/storage/storage-identity-policy.js';

test('storage identity boundary only opens for the exact loaded namespace', () => {
  assert.equal(isStorageIdentityReady('nexusdev_guest', 'nexusdev_guest'), true);
  assert.equal(isStorageIdentityReady('nexusdev_user_a', 'nexusdev_user_a'), true);
  assert.equal(isStorageIdentityReady('nexusdev_user_b', 'nexusdev_user_a'), false);
  assert.equal(isStorageIdentityReady('nexusdev_guest', 'nexusdev_user_a'), false);
  assert.equal(isStorageIdentityReady(null, null), false);
  assert.equal(isStorageIdentityReady('', ''), false);
});

test('account-sensitive application tree fails closed on identity or storage errors', async () => {
  const source = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  assert.ok(source.includes('const storageIdentityReady = !storageLoadError && isStorageIdentityReady(userStoragePrefix, loadedStoragePrefix)'));
  assert.ok(source.includes('{storageIdentityReady ? ('));
  assert.ok(source.includes('Preparando os dados deste perfil com segurança'));
  assert.ok(source.includes('Não foi possível ler os dados locais deste perfil com segurança.'));
  assert.ok(source.includes('setCompletedChallenges([]);'));
  assert.ok(source.includes('setCommunityXP(0);'));
  assert.ok(source.includes('setStreakData({ count: 1, todayCompleted: 0, lastActiveDate: todayStr });'));
  assert.ok(source.includes('setStorageLoadError(true);'));
  assert.ok(!source.includes('catch {\n      setLoadedStoragePrefix(userStoragePrefix);'));
  assert.ok(source.includes('setCapstoneStorageReady(false);'));
  assert.ok(source.includes('setCapstoneChecks({});'));
  assert.ok(source.includes('if (!capstoneStorageReady || !userStoragePrefix || loadedStoragePrefix !== userStoragePrefix) return;'));
});
