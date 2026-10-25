import { decryptJson, encryptJson } from './encrypted-envelope.js';

const SECURE_KEY = 'secure_data';
const LEGACY_KEY = 'main_data';

function stableJson(value) {
  return JSON.stringify(value, (_key, child) => {
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      const sorted = Object.create(null);
      for (const key of Object.keys(child).sort()) sorted[key] = child[key];
      return sorted;
    }
    return child;
  });
}

export class SecureDataRepository {
  constructor(storage) {
    if (!storage || !['get', 'set', 'remove'].every((method) => typeof storage[method] === 'function')) {
      throw new Error('A compatible storage adapter is required');
    }
    this.storage = storage;
  }

  async inspect() {
    const encrypted = await this.storage.get(SECURE_KEY);
    if (encrypted !== null) return { status: 'locked' };
    const legacy = await this.storage.get(LEGACY_KEY);
    return { status: legacy === null ? 'setup' : 'migration' };
  }

  async initialize(password, initialData) {
    const { status } = await this.inspect();
    if (status !== 'setup') throw new Error('Secure storage is already initialized or requires migration');
    await this.save(initialData, password);
    return initialData;
  }

  /** @param {string} password @param {(value: unknown) => boolean | Promise<boolean>} [validate] */
  async migrateLegacy(password, validate = () => true) {
    const { status } = await this.inspect();
    if (status !== 'migration') throw new Error('No legacy data is available to migrate');

    const legacyData = await this.storage.get(LEGACY_KEY);
    if (!(await validate(legacyData))) {
      throw new Error('Legacy data failed validation and was preserved unchanged');
    }
    const encrypted = await encryptJson(legacyData, password);
    await this.storage.set(SECURE_KEY, encrypted);

    const verifiedEnvelope = await this.storage.get(SECURE_KEY);
    const verifiedData = await decryptJson(verifiedEnvelope, password);
    if (JSON.stringify(verifiedData) !== JSON.stringify(legacyData)) {
      throw new Error('Encrypted data verification failed; original data was preserved');
    }

    await this.storage.remove(LEGACY_KEY);
    if (await this.storage.get(LEGACY_KEY) !== null) {
      throw new Error('Encrypted copy created, but legacy plaintext could not be removed');
    }
    return verifiedData;
  }

  /** @param {string} password @param {(value: unknown) => boolean | Promise<boolean>} [validate] */
  async unlock(password, validate = () => true) {
    const envelope = await this.storage.get(SECURE_KEY);
    if (envelope === null) throw new Error('Secure storage has not been initialized');
    const value = await decryptJson(envelope, password);
    const legacy = await this.storage.get(LEGACY_KEY);
    if (legacy !== null) {
      if (!(await validate(value))) {
        throw new Error('Decrypted data failed validation; the legacy plaintext copy was preserved');
      }
      if (stableJson(value) !== stableJson(legacy)) {
        throw new Error('Encrypted data differs from the legacy copy; both were preserved for recovery');
      }
      await this.storage.remove(LEGACY_KEY);
      if (await this.storage.get(LEGACY_KEY) !== null) {
        throw new Error('Encrypted data opened, but a leftover plaintext copy could not be removed');
      }
    }
    return value;
  }

  async save(value, password) {
    const encrypted = await encryptJson(value, password);
    await this.storage.set(SECURE_KEY, encrypted);
    const persisted = await this.storage.get(SECURE_KEY);
    if (persisted === null) throw new Error('Encrypted data could not be read back from local storage');
    const verified = await decryptJson(persisted, password);
    if (JSON.stringify(verified) !== JSON.stringify(value)) {
      throw new Error('Encrypted data verification failed');
    }
  }
}
