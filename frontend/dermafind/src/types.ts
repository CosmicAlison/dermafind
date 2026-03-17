export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

export type ScanStatus = 'clear' | 'review' | 'concern';

export interface ScanRecord {
  id: number;
  score: number;
  date: string;
  lesions: Record<string, number>;
}

export interface BoundingBox {
  x: number;   
  y: number;
  w: number;
  h: number;
  label: string;
  conf: number;
}

export interface ScanResult {
  success: boolean;
  diagnosis?: string;
  confidence?: number;
  description?: string;
  tags?: string[];
  boxes?: BoundingBox[];
}

export type ScanPhase = 'camera' | 'loading' | 'result' | 'error';
export type AppPage = 'dashboard' | 'scan';
