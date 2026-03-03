import { getApiUrl } from '@/lib/env';
import type { ApiErrorPayload, ErrorCode } from '@/types/api';
import { ApiError } from '@/types/api';

const TOKEN_KEY = 'fm_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

const UNAUTHORIZED_EVENT = 'fm:unauthorized';

function emptySuccess(): { success: true; data: null; meta: { timestamp: string } } {
  return { success: true, data: null, meta: { timestamp: new Date().toISOString() } };
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return emptySuccess() as T;
  }
  const text = await res.text();
  if (!text.trim()) {
    if (res.ok) return emptySuccess() as T;
    throw new ApiError(res.statusText || 'Request failed', 'INTERNAL_ERROR');
  }
  const json = JSON.parse(text) as Record<string, unknown>;
  if (!res.ok) {
    if (res.status === 401) {
      clearStoredToken();
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }
    const err = json as unknown as ApiErrorPayload;
    if (err?.error) {
      throw new ApiError(
        err.error.message,
        err.error.code as ErrorCode,
        err.error.details
      );
    }
    throw new ApiError(res.statusText || 'Request failed', 'INTERNAL_ERROR');
  }
  if (json.success === false && json.error) {
    const err = json as unknown as ApiErrorPayload;
    throw new ApiError(
      err.error.message,
      err.error.code as ErrorCode,
      err.error.details
    );
  }
  return json as T;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const base = getApiUrl();
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  const token = getStoredToken();
  if (import.meta.env.DEV) {
    console.log('[api-client]', path, token ? 'Authorization: Bearer present' : 'Authorization: missing');
  }
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  return parseResponse<T>(res);
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
  method: 'POST' | 'PUT' = 'POST'
): Promise<T> {
  const base = getApiUrl();
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  const token = getStoredToken();
  const headers: HeadersInit = {};
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { method, body: formData, headers });
  return parseResponse<T>(res);
}
