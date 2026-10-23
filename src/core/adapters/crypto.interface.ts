export interface ICryptoAdapter {
  encrypt(plainText: string, masterKey: string): Promise<string>;
  decrypt(cipherText: string, masterKey: string): Promise<string>;
  generateHash(text: string, algorithm?: 'SHA-256' | 'SHA-512' | 'MD5'): Promise<string>;
  generateUuid(): string;
  calculatePasswordEntropy(password: string): { entropy: number; score: number; label: string };
}
