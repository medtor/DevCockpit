import test from 'node:test';
import assert from 'node:assert/strict';
import { estimatePassphraseEntropy, generatePassphrase, generateRandomPassword } from '../src/core/security/password-generator.js';

function cryptoWithBytes(bytes) {
  const remaining = [...bytes];
  return {
    getRandomValues(array) {
      for (let index = 0; index < array.length; index += 1) {
        assert.notEqual(remaining.length, 0, 'unexpected request for random bytes');
        array[index] = remaining.shift();
      }
      return array;
    },
  };
}

test('passphrase entropy is based on uniform word choices, not printed character categories', () => {
  const withNumber = estimatePassphraseEntropy(4, 32, true);
  assert.equal(withNumber.entropy, 4 * Math.log2(32) + Math.log2(90));
  assert.equal(withNumber.score, 1);
  assert.equal(withNumber.label, 'Weak');

  assert.deepEqual(estimatePassphraseEntropy(4, 32, false), {
    entropy: 20,
    score: 0,
    label: 'Very Weak',
  });
});
test('both generators fail closed if Web Crypto is unavailable', () => {
  assert.throws(
    () => generateRandomPassword({ length: 1, characters: 'abc', crypto: null }),
    /Web Crypto getRandomValues is required/,
  );
  assert.throws(
    () => generatePassphrase({ wordList: ['alpha'], wordCount: 1, crypto: null }),
    /Web Crypto getRandomValues is required/,
  );
});
test('random string generation uses cryptographic bytes to select characters', () => {
  const result = generateRandomPassword({
    length: 3,
    characters: 'abcd',
    crypto: cryptoWithBytes([0, 1, 3]),
  });

  assert.equal(result, 'abd');
});

test('random string generation rejects bytes outside the unbiased sampling range', () => {
  const result = generateRandomPassword({
    length: 1,
    characters: 'abcdefghij',
    crypto: cryptoWithBytes([250, 9]),
  });

  assert.equal(result, 'j');
});

test('passphrase generation uses cryptographic selection for words and appended number', () => {
  const result = generatePassphrase({
    wordList: ['alpha', 'bravo', 'charlie', 'delta'],
    wordCount: 2,
    appendNumber: true,
    capitalizeFirst: true,
    separator: '-',
    crypto: cryptoWithBytes([3, 0, 89]),
  });

  assert.equal(result, 'Delta-alpha-99');
});
