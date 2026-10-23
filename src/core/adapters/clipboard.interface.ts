export interface IClipboardAdapter {
  writeText(text: string, autoClearSeconds?: number): Promise<void>;
  readText(): Promise<string>;
}
