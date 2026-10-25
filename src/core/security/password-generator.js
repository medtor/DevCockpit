function randomIndex(maxExclusive, cryptoApi) {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > 256) {
    throw new RangeError('Random index range must be an integer between 1 and 256');
  }
  if (!cryptoApi || typeof cryptoApi.getRandomValues !== 'function') {
    throw new Error('Web Crypto getRandomValues is required to generate passwords');
  }

  const acceptanceLimit = Math.floor(256 / maxExclusive) * maxExclusive;
  const byte = new Uint8Array(1);
  do {
    cryptoApi.getRandomValues(byte);
  } while (byte[0] >= acceptanceLimit);
  return byte[0] % maxExclusive;
}

export function generateRandomPassword({ length, characters, crypto = globalThis.crypto }) {
  if (!Number.isInteger(length) || length < 0) {
    throw new RangeError('Password length must be a non-negative integer');
  }
  if (typeof characters !== 'string' || characters.length === 0 || characters.length > 256) {
    throw new RangeError('Character set must contain between 1 and 256 characters');
  }

  let password = '';
  for (let index = 0; index < length; index += 1) {
    password += characters[randomIndex(characters.length, crypto)];
  }
  return password;
}

function scoreEntropy(entropy) {
  if (entropy >= 80) return { entropy, score: 4, label: 'Very Strong' };
  if (entropy >= 60) return { entropy, score: 3, label: 'Strong' };
  if (entropy >= 40) return { entropy, score: 2, label: 'Medium' };
  if (entropy >= 25) return { entropy, score: 1, label: 'Weak' };
  return { entropy, score: 0, label: 'Very Weak' };
}

export function estimatePassphraseEntropy(wordCount, wordListSize, appendNumber = false) {
  if (!Number.isInteger(wordCount) || wordCount < 0) {
    throw new RangeError('Word count must be a non-negative integer');
  }
  if (!Number.isInteger(wordListSize) || wordListSize < 1) {
    throw new RangeError('Word-list size must be a positive integer');
  }
  if (typeof appendNumber !== 'boolean') {
    throw new TypeError('Append-number option must be a boolean');
  }

  const entropy = wordCount * Math.log2(wordListSize) + (appendNumber ? Math.log2(90) : 0);
  return scoreEntropy(entropy);
}


export function generatePassphrase({
  wordList,
  wordCount,
  appendNumber,
  capitalizeFirst,
  separator,
  crypto = globalThis.crypto,
}) {
  if (!Array.isArray(wordList) || wordList.length === 0 || wordList.length > 256) {
    throw new RangeError('Word list must contain between 1 and 256 words');
  }
  if (!Number.isInteger(wordCount) || wordCount < 0) {
    throw new RangeError('Word count must be a non-negative integer');
  }

  const words = [];
  for (let index = 0; index < wordCount; index += 1) {
    let word = wordList[randomIndex(wordList.length, crypto)];
    if (capitalizeFirst && index === 0) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    words.push(word);
  }
  if (appendNumber) {
    words.push(String(10 + randomIndex(90, crypto)));
  }
  return words.join(separator);
}
