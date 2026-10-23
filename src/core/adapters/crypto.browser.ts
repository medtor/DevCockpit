import { ICryptoAdapter } from './crypto.interface';

export class BrowserCryptoAdapter implements ICryptoAdapter {
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as any,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(plainText: string, masterKey: string): Promise<string> {
    if (!plainText) return '';
    if (!masterKey) throw new Error('Master key is required for encryption');

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(masterKey, salt);

    const enc = new TextEncoder();
    const encodedText = enc.encode(plainText);

    const ciphertextBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedText
    );

    const ciphertextArray = new Uint8Array(ciphertextBuffer);

    // Combine Salt(16) + IV(12) + Ciphertext
    const combined = new Uint8Array(salt.length + iv.length + ciphertextArray.length);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(ciphertextArray, salt.length + iv.length);

    // Convert to base64
    let binary = '';
    for (let i = 0; i < combined.byteLength; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return btoa(binary);
  }

  async decrypt(cipherText: string, masterKey: string): Promise<string> {
    if (!cipherText) return '';
    if (!masterKey) throw new Error('Master key is required for decryption');

    try {
      const binary = atob(cipherText);
      const combined = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        combined[i] = binary.charCodeAt(i);
      }

      if (combined.length < 28) {
        throw new Error('Invalid ciphertext payload');
      }

      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 28);
      const data = combined.slice(28);

      const key = await this.deriveKey(masterKey, salt);

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        data
      );

      const dec = new TextDecoder();
      return dec.decode(decryptedBuffer);
    } catch {
      throw new Error('Decryption failed. Please check your Master Password.');
    }
  }

  async generateHash(text: string, algorithm: 'SHA-256' | 'SHA-512' | 'MD5' = 'SHA-256'): Promise<string> {
    if (algorithm === 'MD5') {
      return this.simpleMd5(text);
    }

    const enc = new TextEncoder();
    const data = enc.encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private simpleMd5(str: string): string {
    // Pure JS MD5 lightweight implementation
    function rotateLeft(lValue: number, iShiftBits: number) {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }
    function addUnsigned(lX: number, lY: number) {
      const lX8 = lX & 0x80000000;
      const lY8 = lY & 0x80000000;
      const lX4 = lX & 0x40000000;
      const lY4 = lY & 0x40000000;
      const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
      if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
      if (lX4 | lY4) {
        if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
        else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
      } else {
        return lResult ^ lX8 ^ lY8;
      }
    }
    function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
    function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
    function H(x: number, y: number, z: number) { return x ^ y ^ z; }
    function I(x: number, y: number, z: number) { return y ^ (x | ~z); }
    function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
      a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
      a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
      a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
      a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }

    let x: number[] = [];
    const kLen = str.length;
    for (let i = 0; i < kLen; i++) {
      x[i >> 2] |= (str.charCodeAt(i) & 0xff) << ((i % 4) * 8);
    }
    x[kLen >> 2] |= 0x80 << ((kLen % 4) * 8);
    x[(((kLen + 8) >> 6) << 4) + 14] = kLen * 8;

    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    for (let i = 0; i < x.length; i += 16) {
      const olda = a, oldb = b, oldc = c, oldd = d;
      a = FF(a, b, c, d, x[i + 0] || 0, 7, -680876936);
      d = FF(d, a, b, c, x[i + 1] || 0, 12, -389564586);
      c = FF(c, d, a, b, x[i + 2] || 0, 17, 606105819);
      b = FF(b, c, d, a, x[i + 3] || 0, 22, -1044525330);
      a = FF(a, b, c, d, x[i + 4] || 0, 7, -176418897);
      d = FF(d, a, b, c, x[i + 5] || 0, 12, 1200080426);
      c = FF(c, d, a, b, x[i + 6] || 0, 17, -1473231341);
      b = FF(b, c, d, a, x[i + 7] || 0, 22, -45705983);
      a = FF(a, b, c, d, x[i + 8] || 0, 7, 1770035416);
      d = FF(d, a, b, c, x[i + 9] || 0, 12, -1958414417);
      c = FF(c, d, a, b, x[i + 10] || 0, 17, -42063);
      b = FF(b, c, d, a, x[i + 11] || 0, 22, -1990404162);
      a = FF(a, b, c, d, x[i + 12] || 0, 7, 1804603682);
      d = FF(d, a, b, c, x[i + 13] || 0, 12, -40341101);
      c = FF(c, d, a, b, x[i + 14] || 0, 17, -1502002290);
      b = FF(b, c, d, a, x[i + 15] || 0, 22, 1236535329);

      a = GG(a, b, c, d, x[i + 1] || 0, 5, -165796510);
      d = GG(d, a, b, c, x[i + 6] || 0, 9, -1069501632);
      c = GG(c, d, a, b, x[i + 11] || 0, 14, 643717713);
      b = GG(b, c, d, a, x[i + 0] || 0, 20, -373897302);
      a = GG(a, b, c, d, x[i + 5] || 0, 5, -701558691);
      d = GG(d, a, b, c, x[i + 10] || 0, 9, 38016083);
      c = GG(c, d, a, b, x[i + 15] || 0, 14, -660478335);
      b = GG(b, c, d, a, x[i + 4] || 0, 20, -405537848);
      a = GG(a, b, c, d, x[i + 9] || 0, 5, 568446438);
      d = GG(d, a, b, c, x[i + 14] || 0, 9, -1019803690);
      c = GG(c, d, a, b, x[i + 3] || 0, 14, -187363961);
      b = GG(b, c, d, a, x[i + 8] || 0, 20, 1163531501);
      a = GG(a, b, c, d, x[i + 13] || 0, 5, -1444681467);
      d = GG(d, a, b, c, x[i + 2] || 0, 9, -51403784);
      c = GG(c, d, a, b, x[i + 7] || 0, 14, 1735328473);
      b = GG(b, c, d, a, x[i + 12] || 0, 20, -1926607734);

      a = HH(a, b, c, d, x[i + 5] || 0, 4, -378558);
      d = HH(d, a, b, c, x[i + 8] || 0, 11, -2022574463);
      c = HH(c, d, a, b, x[i + 11] || 0, 16, 1839030562);
      b = HH(b, c, d, a, x[i + 14] || 0, 23, -35309556);
      a = HH(a, b, c, d, x[i + 1] || 0, 4, -1530992060);
      d = HH(d, a, b, c, x[i + 4] || 0, 11, 1272893353);
      c = HH(c, d, a, b, x[i + 7] || 0, 16, -155497632);
      b = HH(b, c, d, a, x[i + 10] || 0, 23, -1094730640);
      a = HH(a, b, c, d, x[i + 13] || 0, 4, 681279174);
      d = HH(d, a, b, c, x[i + 0] || 0, 11, -358537222);
      c = HH(c, d, a, b, x[i + 3] || 0, 16, -722521979);
      b = HH(b, c, d, a, x[i + 6] || 0, 23, 76029189);
      a = HH(a, b, c, d, x[i + 9] || 0, 4, -640364487);
      d = HH(d, a, b, c, x[i + 12] || 0, 11, -421815835);
      c = HH(c, d, a, b, x[i + 15] || 0, 16, 530742520);
      b = HH(b, c, d, a, x[i + 2] || 0, 23, -995338652);

      a = II(a, b, c, d, x[i + 0] || 0, 6, -198630844);
      d = II(d, a, b, c, x[i + 7] || 0, 10, 1126891415);
      c = II(c, d, a, b, x[i + 14] || 0, 15, -1416354905);
      b = II(b, c, d, a, x[i + 5] || 0, 21, -57434055);
      a = II(a, b, c, d, x[i + 12] || 0, 6, 1700485571);
      d = II(d, a, b, c, x[i + 3] || 0, 10, -1894986606);
      c = II(c, d, a, b, x[i + 10] || 0, 15, -1051523);
      b = II(b, c, d, a, x[i + 1] || 0, 21, -2054922799);
      a = II(a, b, c, d, x[i + 8] || 0, 6, 1873313359);
      d = II(d, a, b, c, x[i + 15] || 0, 10, -30611744);
      c = II(c, d, a, b, x[i + 6] || 0, 15, -1560198380);
      b = II(b, c, d, a, x[i + 13] || 0, 21, 1309151649);
      a = II(a, b, c, d, x[i + 4] || 0, 6, -145523070);
      d = II(d, a, b, c, x[i + 11] || 0, 10, -1120210379);
      c = II(c, d, a, b, x[i + 2] || 0, 15, 718787259);
      b = II(b, c, d, a, x[i + 9] || 0, 21, -343485551);

      a = addUnsigned(a, olda);
      b = addUnsigned(b, oldb);
      c = addUnsigned(c, oldc);
      d = addUnsigned(d, oldd);
    }
    const hex = (n: number) => {
      let s = '', j;
      for (j = 0; j <= 3; j++) {
        s += ((n >> (j * 8)) & 255).toString(16).padStart(2, '0');
      }
      return s;
    };
    return (hex(a) + hex(b) + hex(c) + hex(d)).toLowerCase();
  }

  generateUuid(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  calculatePasswordEntropy(password: string): { entropy: number; score: number; label: string } {
    if (!password) return { entropy: 0, score: 0, label: 'Very Weak' };

    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

    if (poolSize === 0) poolSize = 1;
    const entropy = Math.round(password.length * (Math.log2(poolSize)));

    let score = 0;
    let label = 'Very Weak';

    if (entropy >= 80) {
      score = 4;
      label = 'Very Strong';
    } else if (entropy >= 60) {
      score = 3;
      label = 'Strong';
    } else if (entropy >= 40) {
      score = 2;
      label = 'Medium';
    } else if (entropy >= 25) {
      score = 1;
      label = 'Weak';
    }

    return { entropy, score, label };
  }
}

export const defaultCryptoAdapter = new BrowserCryptoAdapter();
