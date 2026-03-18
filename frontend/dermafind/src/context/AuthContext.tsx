import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type {
  AuthContextValue,
  AuthState,
  AuthResponse,
  LoginCredentials,
  SignupCredentials,
  User,
} from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.dermafind.app";
const REFRESH_THRESHOLD_MS = 2 * 60 * 1000;

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function tokenExpiresAt(token: string): number | null {
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return null;
  return payload.exp * 1000;
}

function isTokenNearExpiry(token: string) {
  const exp = tokenExpiresAt(token);
  if (!exp) return true;
  return Date.now() >= exp - REFRESH_THRESHOLD_MS;
}

async function apiLogin(credentials: LoginCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (!res.ok) throw new Error("Login failed");

  return res.json();
}

async function apiSignup(credentials: SignupCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (!res.ok) throw new Error("Signup failed");

  return res.json();
}

async function apiRefreshToken(): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Refresh failed");

  return res.json();
}

async function apiLogout() {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const accessTokenRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshPromiseRef = useRef<Promise<AuthResponse> | null>(null);

  const scheduleRefresh = useCallback((token: string) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    const exp = tokenExpiresAt(token);
    if (!exp) return;

    const delay = Math.max(exp - Date.now() - REFRESH_THRESHOLD_MS, 1000);

    refreshTimerRef.current = setTimeout(() => {
      refreshToken();
    }, delay);
  }, []);

  const applyAuth = useCallback((accessToken: string, user: User) => {
    accessTokenRef.current = accessToken;

    setState({
      user,
      accessToken,
      isLoading: false,
      isAuthenticated: true,
    });

    scheduleRefresh(accessToken);
  }, [scheduleRefresh]);

  const refreshToken = useCallback(async (): Promise<AuthResponse> => {
    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = apiRefreshToken()
        .then((res) => {
          applyAuth(res.accessToken, res.user);
          return res;
        })
        .finally(() => {
          refreshPromiseRef.current = null;
        });
    }

    return refreshPromiseRef.current;
  }, [applyAuth]);

  useEffect(() => {
    refreshToken()
      .catch(() => {
        setState((s) => ({ ...s, isLoading: false }));
      });
  }, [refreshToken]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const res = await apiLogin(credentials);
    applyAuth(res.accessToken, res.user);
  }, [applyAuth]);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    const res = await apiSignup(credentials);
    applyAuth(res.accessToken, res.user);
  }, [applyAuth]);

  const logout = useCallback(async () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    accessTokenRef.current = null;

    await apiLogout();

    setState({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const token = accessTokenRef.current;
    if (!token) return null;

    if (isTokenNearExpiry(token)) {
      const res = await refreshToken();
      return res.accessToken;
    }

    return token;
  }, [refreshToken]);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}