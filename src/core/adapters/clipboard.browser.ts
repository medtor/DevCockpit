import { IClipboardAdapter } from './clipboard.interface';

export class BrowserClipboardAdapter implements IClipboardAdapter {
  private autoClearTimers: Map<number, NodeJS.Timeout> = new Map();

  async writeText(text: string, autoClearSeconds?: number): Promise<void> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for iframe environments or unsupported browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      if (autoClearSeconds && autoClearSeconds > 0) {
        const timerId = setTimeout(async () => {
          try {
            const current = await this.readText();
            if (current === text) {
              await this.writeText('');
            }
          } catch {
            // silent ignore
          }
        }, autoClearSeconds * 1000);
        this.autoClearTimers.set(Date.now(), timerId as any);
      }
    } catch (e) {
      console.warn('Clipboard write error:', e);
    }
  }

  async readText(): Promise<string> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
        return await navigator.clipboard.readText();
      }
    } catch {
      // ignore
    }
    return '';
  }
}

export const defaultClipboardAdapter = new BrowserClipboardAdapter();
