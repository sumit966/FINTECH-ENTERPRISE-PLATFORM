// Thin fetch wrapper that attaches the JWT and normalises errors.

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

const TOKEN_KEY = 'nexus.jwt';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export class ApiRequestError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  query?: Record<string, any>;
  signal?: AbortSignal;
}

function buildQuery(query?: Record<string, any>): string {
  if (!query) return '';
  const parts: string[] = [];
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '') continue;
    parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(v)));
  }
  return parts.length ? '?' + parts.join('&') : '';
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = API_BASE + path + buildQuery(options.query);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (res.status === 204) return undefined as unknown as T;

  let payload: any = null;
  const text = await res.text();
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = text; }
  }

  if (!res.ok) {
    const message = (payload && payload.error) || (payload && payload.message) || res.statusText || 'Request failed';
    throw new ApiRequestError(message, res.status, payload && payload.code);
  }

  // Server responses are wrapped as { success, data }. Unwrap if present.
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload.data as T;
  }
  return payload as T;
}

export const api = {
  get: <T>(path: string, query?: Record<string, any>) => apiRequest<T>(path, { method: 'GET', query }),
  post: <T>(path: string, body?: any) => apiRequest<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: any) => apiRequest<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: any) => apiRequest<T>(path, { method: 'PATCH', body }),
  del: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
};

export { API_BASE };