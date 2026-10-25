const ENVELOPE_VERSION = 1;
const KDF = 'PBKDF2-SHA-256';
const CIPHER = 'AES-256-GCM';
const ITERATIONS = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

function cryptoApi() {
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
    throw new Error('Web Crypto is required for encrypted storage');
  }
  return globalThis.crypto;
}

function toBase64(bytes) {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

function fromBase64(value) {
  if (typeof value !== 'string' || !value || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    throw new Error('Invalid encrypted payload');
  }
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function additionalData() {
  return new TextEncoder().encode(JSON.stringify({
    version: ENVELOPE_VERSION,
    kdf: KDF,
    cipher: CIPHER,
    iterations: ITERATIONS,
  }));
}

async function deriveAesKey(password, salt) {
  const webCrypto = cryptoApi();
  const material = await webCrypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return webCrypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptJson(value, password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('A non-empty password is required');
  }
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new Error('Value cannot be serialized as JSON');

  const webCrypto = cryptoApi();
  const salt = webCrypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = webCrypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveAesKey(password, salt);
  const ciphertext = await webCrypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: additionalData(), tagLength: 128 },
    key,
    new TextEncoder().encode(serialized),
  );

  return {
    version: ENVELOPE_VERSION,
    kdf: KDF,
    cipher: CIPHER,
    iterations: ITERATIONS,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
  };
}

export async function decryptJson(envelope, password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('A non-empty password is required');
  }
  if (
    !envelope ||
    envelope.version !== ENVELOPE_VERSION ||
    envelope.kdf !== KDF ||
    envelope.cipher !== CIPHER ||
    envelope.iterations !== ITERATIONS
  ) {
    throw new Error('Unsupported encrypted payload');
  }

  const salt = fromBase64(envelope.salt);
  const iv = fromBase64(envelope.iv);
  const ciphertext = fromBase64(envelope.ciphertext);
  if (salt.length !== SALT_BYTES || iv.length !== IV_BYTES || ciphertext.length < 16) {
    throw new Error('Invalid encrypted payload');
  }

  try {
    const webCrypto = cryptoApi();
    const key = await deriveAesKey(password, salt);
    const plaintext = await webCrypto.subtle.decrypt(
      { name: 'AES-GCM', iv, additionalData: additionalData(), tagLength: 128 },
      key,
      ciphertext,
    );
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(plaintext));
  } catch {
    throw new Error('Unable to decrypt data: incorrect password or corrupted payload');
  }
}
