import { get, set, del, clear } from 'idb-keyval';
import { IStorageAdapter } from './storage.interface';

export class BrowserStorageAdapter implements IStorageAdapter {
  private prefix: string;

  constructor(prefix: string = 'devdesk_') {
    this.prefix = prefix;
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = `${this.prefix}${key}`;
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const value = await get<T>(fullKey);
        if (value !== undefined) {
          return value;
        }
      }
    } catch {
      // fallback to localStorage
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(fullKey);
        if (item !== null) {
          return JSON.parse(item) as T;
        }
      }
    } catch {
      // storage unavailable
    }
    return null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const fullKey = `${this.prefix}${key}`;
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        await set(fullKey, value);
      }
    } catch {
      // indexeddb error
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(fullKey, JSON.stringify(value));
      }
    } catch {
      // localstorage error
    }
  }

  async remove(key: string): Promise<void> {
    const fullKey = `${this.prefix}${key}`;
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        await del(fullKey);
      }
    } catch {
      // indexeddb error
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(fullKey);
      }
    } catch {
      // localstorage error
    }
  }

  async clear(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        await clear();
      }
    } catch {
      // indexeddb error
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && key.startsWith(this.prefix)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => window.localStorage.removeItem(k));
      }
    } catch {
      // localstorage error
    }
  }
}

export const defaultStorageAdapter = new BrowserStorageAdapter();
