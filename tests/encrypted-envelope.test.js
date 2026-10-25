import test from 'node:test';
import assert from 'node:assert/strict';
import { decryptJson, encryptJson } from '../src/core/security/encrypted-envelope.js';

test('encryptJson hides serialized data and decryptJson restores it with the password', async () => {
  const value = { apiKeys: [{ apiKey: 'sensitive-token-value' }], notes: ['private note'] };
  const envelope = await encryptJson(value, 'correct horse battery staple');

  assert.equal(envelope.version, 1);
  assert.equal(JSON.stringify(envelope).includes('sensitive-token-value'), false);
  assert.deepEqual(await decryptJson(envelope, 'correct horse battery staple'), value);
});

test('decryptJson rejects a wrong password and modified ciphertext', async () => {
  const envelope = await encryptJson({ secret: 'value' }, 'correct horse battery staple');

  await assert.rejects(() => decryptJson(envelope, 'wrong password'));

  const tampered = { ...envelope, ciphertext: `${envelope.ciphertext.slice(0, -2)}AA` };
  await assert.rejects(() => decryptJson(tampered, 'correct horse battery staple'));
});

test('encryptJson rejects empty passwords and decryptJson rejects unsupported envelopes', async () => {
  await assert.rejects(() => encryptJson({ secret: 'value' }, ''));
  await assert.rejects(() => decryptJson({ version: 999 }, 'password'));
});
