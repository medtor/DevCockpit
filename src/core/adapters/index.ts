import { IStorageAdapter } from './storage.interface';
import { IHttpAdapter } from './http.interface';
import { IClipboardAdapter } from './clipboard.interface';
import { ICryptoAdapter } from './crypto.interface';
import { defaultStorageAdapter } from './storage.browser';
import { defaultHttpAdapter } from './http.browser';
import { defaultClipboardAdapter } from './clipboard.browser';
import { defaultCryptoAdapter } from './crypto.browser';

export * from './storage.interface';
export * from './http.interface';
export * from './clipboard.interface';
export * from './crypto.interface';

export interface PlatformAdapters {
  storage: IStorageAdapter;
  http: IHttpAdapter;
  clipboard: IClipboardAdapter;
  crypto: ICryptoAdapter;
}

let activeAdapters: PlatformAdapters = {
  storage: defaultStorageAdapter,
  http: defaultHttpAdapter,
  clipboard: defaultClipboardAdapter,
  crypto: defaultCryptoAdapter,
};

export function setPlatformAdapters(adapters: Partial<PlatformAdapters>) {
  activeAdapters = {
    ...activeAdapters,
    ...adapters,
  };
}

export function getPlatformAdapters(): PlatformAdapters {
  return activeAdapters;
}
