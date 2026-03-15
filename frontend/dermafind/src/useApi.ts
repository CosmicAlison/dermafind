import { useCallback } from 'react';
import { useAuth } from './context/AuthContext';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.dermafind.app';

/**
 * useApi — authenticated fetch wrapper.
 *
 * Automatically:
 *   - Injects a fresh Bearer token on every request
 *   - Refreshes the access token transparently if near expiry
 *   - Throws on non-2xx responses with the server error message
 *
 * Usage:
 *   const api = useApi();
 *   const data = await api<MyScanResult>('/scans', { method: 'POST', body: formData });
 */
export function useApi() {
  const { refreshAccessToken, logout } = useAuth();

  const request = useCallback(async <T = unknown>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> => {
    const token = await refreshAccessToken();

    if (!token) {
      logout();
      throw new Error('Not authenticated');
    }

    const { method = 'GET', body, headers = {} } = options;

    const isFormData = body instanceof FormData;

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData — browser sets it with boundary
        ...(!isFormData && body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: isFormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error((err as { message?: string }).message ?? `Request failed: ${res.status}`);
    }

    // 204 No Content
    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
  }, [refreshAccessToken, logout]);

  return request;
}
