import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import type {
  AuthContextValue,
  AuthState,
  AuthResponse, 
  LoginCredentials,
  SignupCredentials,
  User,
} from '../types';

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.dermafind.app';

// Refresh 2 minutes before expiry (tokens assumed 15-min lifetime)
const REFRESH_THRESHOLD_MS = 2 * 60 * 1000;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function tokenExpiresAt(token: string): number | null {
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  return payload.exp * 1000; // convert to ms
}

function isTokenExpired(token: string): boolean {
  const exp = tokenExpiresAt(token);
  if (exp === null) return true;
  return Date.now() >= exp;
}

function isTokenNearExpiry(token: string): boolean {
  const exp = tokenExpiresAt(token);
  if (exp === null) return true;
  return Date.now() >= exp - REFRESH_THRESHOLD_MS;
}

function userFromToken(token: string): User | null {
  const payload = parseJwtPayload(token);
  if (!payload) return null;
  return {
    id: String(payload.sub ?? ''),
    username: String(payload.username ?? ''),
    email: String(payload.email ?? ''),
  };
}


async function apiLogin(credentials: LoginCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Login failed');
  }
  const data = await res.json() as { user: User, accessToken: string };
  return { user: data.user, accessToken: data.accessToken };
}

async function apiSignup(credentials: SignupCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Signup failed');
  }
  const data = await res.json() as { user: User, accessToken: string };
  return { user: data.user, accessToken: data.accessToken};
}

async function apiRefreshToken(): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Token refresh failed');
  const data = await res.json() as { user: User, accessToken: string };
  return data.accessToken;
}

async function apiLogout(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Ref so refresh timer always sees latest tokens without re-registering
  const accessTokenRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  function applyAccessToken(accessToken: string) {
    const user = userFromToken(accessToken);
    accessTokenRef.current = accessToken;
    setState({
      user,
      accessToken,
      isLoading: false,
      isAuthenticated: true,
    });
    scheduleRefresh(accessToken);
  }

  // ── Schedule silent refresh before expiry ───────────────────────────────────
  function scheduleRefresh(accessToken: string) {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const exp = tokenExpiresAt(accessToken);
    if (!exp) return;
    const delay = Math.max(exp - Date.now() - REFRESH_THRESHOLD_MS, 0);
    refreshTimerRef.current = setTimeout(silentRefresh, delay);
  }

  const silentRefresh = useCallback(async () => {
    try {
      const newAccessToken = await apiRefreshToken();
      applyAccessToken(newAccessToken);
    } catch {
      logout();
    }
  }, []);

  useEffect(() => {
    apiRefreshToken()
      .then(applyAccessToken)
      .catch(() => {
        setState(s => ({ ...s, isLoading: false }));
      });
  }, []);

  useEffect(() => {
    return () => { if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current); };
  }, []);

  // ── Public API ───────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials: LoginCredentials) => {
    const tokens = await apiLogin(credentials);
    applyAccessToken(tokens.accessToken);
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    const tokens = await apiSignup(credentials);
    applyAccessToken(tokens.accessToken);
  }, []);

  const logout = useCallback(async () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    accessTokenRef.current = null;
    await apiLogout();
    setState({ user: null, accessToken: null, isLoading: false, isAuthenticated: false });
  }, []);

  /**
   * Call this in API requests that need a valid access token.
   * Returns a fresh token, transparently refreshing if near expiry.
   */
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const token = accessTokenRef.current;
    if (!token) return null;
    if (isTokenNearExpiry(token)) {
      try {
        const newToken = await apiRefreshToken();
        applyAccessToken(newToken);
        return newToken;
      } catch {
        logout();
        return null;
      }
    }
    return token;
  }, [logout]);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
