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
  AuthTokens,
  LoginCredentials,
  SignupCredentials,
  User,
} from '../index';

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.dermafind.app';
const ACCESS_TOKEN_KEY = 'df_access_token';
const REFRESH_TOKEN_KEY = 'df_refresh_token';
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
    name: String(payload.name ?? ''),
    email: String(payload.email ?? ''),
  };
}


async function apiLogin(credentials: LoginCredentials): Promise<AuthTokens> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Login failed');
  }
  const data = await res.json() as { access_token: string; refresh_token: string };
  return { accessToken: data.access_token, refreshToken: data.refresh_token };
}

async function apiSignup(credentials: SignupCredentials): Promise<AuthTokens> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Signup failed');
  }
  const data = await res.json() as { access_token: string; refresh_token: string };
  return { accessToken: data.access_token, refreshToken: data.refresh_token };
}

async function apiRefreshToken(refreshToken: string): Promise<AuthTokens> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) throw new Error('Token refresh failed');
  const data = await res.json() as { access_token: string; refresh_token: string };
  return { accessToken: data.access_token, refreshToken: data.refresh_token };
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Ref so refresh timer always sees latest tokens without re-registering
  const tokensRef = useRef<AuthTokens | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Persist tokens ──────────────────────────────────────────────────────────
  function persistTokens(tokens: AuthTokens) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  function clearPersistedTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  // ── Apply a valid token pair to state ───────────────────────────────────────
  function applyTokens(tokens: AuthTokens) {
    const user = userFromToken(tokens.accessToken);
    tokensRef.current = tokens;
    setState({
      user,
      tokens,
      isLoading: false,
      isAuthenticated: true,
    });
    persistTokens(tokens);
    scheduleRefresh(tokens.accessToken);
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
    const current = tokensRef.current;
    if (!current) return;
    try {
      const newTokens = await apiRefreshToken(current.refreshToken);
      applyTokens(newTokens);
    } catch {
      // Refresh token expired — force logout
      logout();
    }
  }, []);

  // ── Boot: restore session from storage ──────────────────────────────────────
  useEffect(() => {
    const access = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!access || !refresh) {
      setState(s => ({ ...s, isLoading: false }));
      return;
    }

    if (isTokenExpired(access)) {
      // Try a silent refresh immediately
      apiRefreshToken(refresh)
        .then(applyTokens)
        .catch(() => {
          clearPersistedTokens();
          setState(s => ({ ...s, isLoading: false }));
        });
      return;
    }

    applyTokens({ accessToken: access, refreshToken: refresh });

    // If near expiry, kick off refresh now
    if (isTokenNearExpiry(access)) {
      silentRefresh();
    }
  }, []);

  // ── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  // ── Public API ───────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials: LoginCredentials) => {
    const tokens = await apiLogin(credentials);
    applyTokens(tokens);
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    const tokens = await apiSignup(credentials);
    applyTokens(tokens);
  }, []);

  const logout = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    tokensRef.current = null;
    clearPersistedTokens();
    setState({ user: null, tokens: null, isLoading: false, isAuthenticated: false });
  }, []);

  /**
   * Call this in API requests that need a valid access token.
   * Returns a fresh token, transparently refreshing if near expiry.
   */
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const current = tokensRef.current;
    if (!current) return null;
    if (isTokenNearExpiry(current.accessToken)) {
      try {
        const newTokens = await apiRefreshToken(current.refreshToken);
        applyTokens(newTokens);
        return newTokens.accessToken;
      } catch {
        logout();
        return null;
      }
    }
    return current.accessToken;
  }, [logout]);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, refreshAccessToken }}>
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
