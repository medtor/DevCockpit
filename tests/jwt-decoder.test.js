import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeJwt } from '../src/core/security/jwt-decoder.js';

const encodeJson = (value) =>
  Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');

test('decodes Unicode JSON objects from unpadded Base64URL segments', () => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { name: 'Zoë 🌿', city: '東京' };
  const result = decodeJwt(`${encodeJson(header)}.${encodeJson(payload)}.c2ln`);

  assert.deepEqual(result.header, header);
  assert.deepEqual(result.payload, payload);
  assert.equal(result.signature, 'c2ln');
});

test('rejects non-string input with a validation error', () => {
  assert.throws(() => decodeJwt(null), (error) =>
    error instanceof TypeError && error.message === 'JWT token must be a string');
  assert.throws(() => decodeJwt(42), /string/i);
});

test('accepts canonical Base64URL segments with lengths modulo four of two and three', () => {
  for (const remainder of [2, 3]) {
    const candidate = Array.from({ length: 20 }, (_, index) => encodeJson({ value: 'a'.repeat(index) }))
      .find((segment) => segment.length % 4 === remainder);
    assert.ok(candidate, `expected to find a canonical segment with remainder ${remainder}`);
    assert.deepEqual(decodeJwt(`${encodeJson({ alg: 'none' })}.${candidate}.`).payload,
      JSON.parse(Buffer.from(candidate, 'base64url').toString('utf8')));
  }
});

test('rejects tokens that do not have exactly three compact parts', () => {
  assert.throws(() => decodeJwt('only.two'), /exactly three/i);
  assert.throws(() => decodeJwt('one.two.three.four'), /exactly three/i);
});

test('rejects malformed Base64URL segments', () => {
  assert.throws(() => decodeJwt('a*.e30.sig'), /base64url/i);
});

test('rejects malformed signature encoding', () => {
  assert.throws(() => decodeJwt(`${encodeJson({})}.${encodeJson({})}.%%%`), /base64url.*signature/i);
});

test('rejects non-canonical Base64URL padding bits', () => {
  assert.throws(() => decodeJwt(`AB.${encodeJson({})}.sig`), /base64url/i);
});

test('rejects invalid UTF-8 in JWT JSON segments', () => {
  const invalidUtf8 = Buffer.from([0xff]).toString('base64url');
  assert.throws(() => decodeJwt(`${encodeJson({})}.${invalidUtf8}.sig`), /base64url/i);
});
test('rejects segments that do not decode to JSON objects', () => {
  const primitive = Buffer.from('true').toString('base64url');
  const malformedJson = Buffer.from('{').toString('base64url');
  assert.throws(() => decodeJwt(`${primitive}.${encodeJson({})}.sig`), /object/i);
  assert.throws(() => decodeJwt(`${encodeJson({})}.${malformedJson}.sig`), /json/i);
});

test('treats an empty signature part as absent', () => {
  const result = decodeJwt(`${encodeJson({ alg: 'none' })}.${encodeJson({ sub: '123' })}.`);

  assert.equal(result.signature, null);
});
