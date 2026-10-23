import { HttpRequestConfig, HttpResponse, IHttpAdapter } from './http.interface';

export class BrowserHttpAdapter implements IHttpAdapter {
  async request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    const { url, method = 'GET', headers = {}, body, timeoutMs = 15000 } = config;
    const startTime = performance.now();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let formattedBody: string | undefined = undefined;
    const reqHeaders: Record<string, string> = { ...headers };

    if (body) {
      if (typeof body === 'object') {
        formattedBody = JSON.stringify(body);
        if (!reqHeaders['Content-Type'] && !reqHeaders['content-type']) {
          reqHeaders['Content-Type'] = 'application/json';
        }
      } else {
        formattedBody = String(body);
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: reqHeaders,
        body: ['GET', 'HEAD'].includes(method) ? undefined : formattedBody,
        signal: controller.signal,
      });

      clearTimeout(timer);
      const timeMs = Math.round(performance.now() - startTime);

      const respHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        respHeaders[key] = val;
      });

      const rawText = await response.text();
      let data: any = rawText;
      try {
        data = JSON.parse(rawText);
      } catch {
        // text format
      }

      return {
        status: response.status,
        statusText: response.statusText || (response.ok ? 'OK' : 'Error'),
        headers: respHeaders,
        data: data as T,
        rawText,
        timeMs,
        isCorsRestricted: false,
      };
    } catch (err: any) {
      clearTimeout(timer);
      const timeMs = Math.round(performance.now() - startTime);

      const isAborted = err.name === 'AbortError';
      const isCorsError =
        err.name === 'TypeError' &&
        (err.message.includes('Failed to fetch') ||
          err.message.includes('NetworkError') ||
          err.message.includes('Load failed'));

      return {
        status: 0,
        statusText: isAborted ? 'Request Timeout' : isCorsError ? 'CORS Restricted (Browser Mode)' : 'Network Error',
        headers: {},
        data: null as any,
        rawText: '',
        timeMs,
        isCorsRestricted: isCorsError,
        error: isAborted
          ? `Request timed out after ${timeoutMs}ms`
          : isCorsError
          ? 'Browser security blocked this cross-origin request. In Native Desktop (Electron/Tauri), this request bypasses CORS.'
          : err.message || 'Unknown network error',
      };
    }
  }

  generateCurl(config: HttpRequestConfig): string {
    const { url, method = 'GET', headers = {}, body } = config;
    let curl = `curl -X ${method} "${url}"`;

    Object.entries(headers).forEach(([k, v]) => {
      curl += ` \\\n  -H "${k}: ${v.replace(/"/g, '\\"')}"`;
    });

    if (body && !['GET', 'HEAD'].includes(method)) {
      const bodyStr = typeof body === 'object' ? JSON.stringify(body, null, 2) : String(body);
      curl += ` \\\n  -d '${bodyStr.replace(/'/g, "'\\''")}'`;
    }

    return curl;
  }
}

export const defaultHttpAdapter = new BrowserHttpAdapter();
