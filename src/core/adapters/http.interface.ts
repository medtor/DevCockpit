export interface HttpRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
  headers?: Record<string, string>;
  body?: string | Record<string, any>;
  timeoutMs?: number;
}

export interface HttpResponse<T = any> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  timeMs: number;
  isCorsRestricted?: boolean;
  rawText?: string;
  error?: string;
}

export interface IHttpAdapter {
  request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>>;
  generateCurl(config: HttpRequestConfig): string;
}
