const BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const validateBase64Url = (segment, label) => {
  const remainder = segment.length % 4;
  if (!/^[A-Za-z0-9_-]*$/.test(segment) || remainder === 1) {
    throw new Error(`Invalid Base64URL ${label} segment`);
  }

  const lastSextet = BASE64URL_ALPHABET.indexOf(segment[segment.length - 1]);
  if ((remainder === 2 && (lastSextet & 0x0f) !== 0) ||
      (remainder === 3 && (lastSextet & 0x03) !== 0)) {
    throw new Error(`Invalid Base64URL ${label} segment`);
  }
};

const decodeBase64UrlUtf8 = (segment, label) => {
  validateBase64Url(segment, label);

  try {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`Invalid Base64URL ${label} segment`);
  }
};

const decodeJsonObject = (segment, label) => {
  const text = decodeBase64UrlUtf8(segment, label);
  let value;

  try {
    value = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON in JWT ${label} segment`);
  }

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`JWT ${label} must be a JSON object`);
  }

  return value;
};

/** Decode JWT compact serialization locally; this does not validate its signature or claims. */
export const decodeJwt = (token) => {
  if (typeof token !== 'string') {
    throw new TypeError('JWT token must be a string');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('JWT must contain exactly three compact parts');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  validateBase64Url(encodedSignature, 'signature');
  return {
    header: decodeJsonObject(encodedHeader, 'header'),
    payload: decodeJsonObject(encodedPayload, 'payload'),
    signature: encodedSignature || null,
  };
};
