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

test('account-sensitive application tree is conditionally withheld during namespace transitions', async () => {
  const source = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
  assert.match(source, /const storageIdentityReady = !storageLoadError && isStorageIdentityReady\(userStoragePrefix, loadedStoragePrefix\)/);
  assert.match(source, /\{storageIdentityReady \? \(/);
  assert.match(source, /Preparando os dados deste perfil com segurança/);
  assert.match(source, /if \(!userStoragePrefix \|\| loadedStoragePrefix !== userStoragePrefix\) return;/);
  assert.match(source, /setCompletedChallenges\(\[\]\);[\\s\\S]*setCommunityXP\(0\);[\\s\\S]*setStreakData\(\{ count: 1/);
  assert.match(source, /setStorageLoadError\(true\);/);
  assert.doesNotMatch(source, /catch \{\s*setLoadedStoragePrefix\(userStoragePrefix\);/);
  assert.match(source, /setCapstoneStorageReady\(false\);[\\s\\S]*setCapstoneChecks\(\{\}\);/);
  assert.match(source, /if \(!capstoneStorageReady \|\| !userStoragePrefix \|\| loadedStoragePrefix !== userStoragePrefix\) return;/);
});
