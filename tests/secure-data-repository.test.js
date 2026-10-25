import test from 'node:test';
import assert from 'node:assert/strict';
import { SecureDataRepository } from '../src/core/security/secure-data-repository.js';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    async get(key) { return values.has(key) ? values.get(key) : null; },
    async set(key, value) { values.set(key, value); },
    async remove(key) { values.delete(key); },
  };
}

test('inspect identifies fresh, legacy plaintext, and encrypted storage without exposing data', async () => {
  const fresh = new SecureDataRepository(memoryStorage());
  assert.equal((await fresh.inspect()).status, 'setup');

  const legacy = new SecureDataRepository(memoryStorage({ main_data: { data: { passwords: [{ password: 'legacy-secret' }] } } }));
  assert.equal((await legacy.inspect()).status, 'migration');

  const lockedStorage = memoryStorage({ secure_data: { version: 1 } });
  const locked = new SecureDataRepository(lockedStorage);
  assert.equal((await locked.inspect()).status, 'locked');
});

test('migration writes verified ciphertext before deleting legacy plaintext', async () => {
  const legacyData = { data: { apiKeys: [{ apiKey: 'legacy-secret' }] } };
  const storage = memoryStorage({ main_data: legacyData });
  const repository = new SecureDataRepository(storage);

  const restored = await repository.migrateLegacy('long passphrase');

  assert.deepEqual(restored, legacyData);
  assert.equal(storage.values.has('main_data'), false);
  assert.equal(JSON.stringify(storage.values.get('secure_data')).includes('legacy-secret'), false);
  assert.deepEqual(await repository.unlock('long passphrase'), legacyData);
});

test('save stores only authenticated ciphertext and unlock rejects a wrong password', async () => {
  const storage = memoryStorage();
  const repository = new SecureDataRepository(storage);
  const value = { notes: [{ content: 'private note' }] };

  await repository.save(value, 'long passphrase');

  assert.equal(JSON.stringify([...storage.values]).includes('private note'), false);
  assert.deepEqual(await repository.unlock('long passphrase'), value);
  await assert.rejects(() => repository.unlock('incorrect'));
});

test('migration preserves plaintext when validation rejects the legacy dataset', async () => {
  const legacyData = { not: 'a valid backup' };
  const storage = memoryStorage({ main_data: legacyData });
  const repository = new SecureDataRepository(storage);

  await assert.rejects(() => repository.migrateLegacy('long passphrase', () => false));

  assert.equal(storage.values.has('main_data'), true);
  assert.equal(storage.values.has('secure_data'), false);
});

test('unlock removes a leftover plaintext copy from an interrupted migration', async () => {
  const legacyData = { data: { notes: [{ content: 'private' }] } };
  const encrypted = await (await import('../src/core/security/encrypted-envelope.js')).encryptJson(legacyData, 'long passphrase');
  const storage = memoryStorage({ secure_data: encrypted, main_data: legacyData });
  const repository = new SecureDataRepository(storage);

  assert.deepEqual(await repository.unlock('long passphrase'), legacyData);
  assert.equal(storage.values.has('main_data'), false);
});

test('unlock preserves a legacy plaintext copy until the decrypted payload passes validation', async () => {
  const { encryptJson } = await import('../src/core/security/encrypted-envelope.js');
  const legacyData = { valid: true, data: 'recoverable legacy copy' };
  const envelope = await encryptJson({ invalid: true }, 'long passphrase');
  const storage = memoryStorage({ secure_data: envelope, main_data: legacyData });
  const repository = new SecureDataRepository(storage);

  await assert.rejects(() => repository.unlock('long passphrase', (value) => value.valid === true));
  assert.equal(storage.values.has('main_data'), true);
});

test('unlock preserves legacy plaintext when it does not match the decrypted data', async () => {
  const { encryptJson } = await import('../src/core/security/encrypted-envelope.js');
  const legacyData = { revision: 1, secret: 'newer plaintext' };
  const envelope = await encryptJson({ revision: 0, secret: 'older ciphertext' }, 'long passphrase');
  const storage = memoryStorage({ secure_data: envelope, main_data: legacyData });
  const repository = new SecureDataRepository(storage);

  await assert.rejects(() => repository.unlock('long passphrase', () => true));
  assert.equal(storage.values.has('main_data'), true);
});

test('unlock detects divergent own __proto__ data without deleting the legacy copy', async () => {
  const { encryptJson } = await import('../src/core/security/encrypted-envelope.js');
  const legacyData = JSON.parse('{"envVars":{"__proto__":"plain"}}');
  const encryptedData = JSON.parse('{"envVars":{"__proto__":"cipher"}}');
  const envelope = await encryptJson(encryptedData, 'long passphrase');
  const storage = memoryStorage({ secure_data: envelope, main_data: legacyData });
  const repository = new SecureDataRepository(storage);

  await assert.rejects(() => repository.unlock('long passphrase', () => true));
  assert.equal(storage.values.has('main_data'), true);
});

test('save fails if the storage adapter cannot read back the ciphertext', async () => {
  const unavailableStorage = {
    async get() { return null; },
    async set() {},
    async remove() {},
  };
  const repository = new SecureDataRepository(unavailableStorage);

  await assert.rejects(() => repository.save({ secret: 'value' }, 'long passphrase'));
});
