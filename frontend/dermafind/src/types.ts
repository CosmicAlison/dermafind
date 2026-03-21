export interface User {
  id: Number;
  username: string;
  email: string;
  profileUrl?: string;
}

export interface Recommendation{
    id :  Number       
    user_id: Number   
    content : string   
    created_at : Date
}

export interface AuthResponse {
  user: User, 
  accessToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
}

export type ScanStatus = 'clear' | 'review' | 'concern';

export interface ScanBox {
  x: number;     
  y: number;     
  w: number;     
  h: number;     
  label: string;
  conf: number;
}

export interface ScanResult {
  id:          number;
  user_id:     string;
  result:      number;   
  date:        string;
  blackhead:  number;
  darkspot:   number;
  papule:     number;
  pustule:    number;
  whitehead:  number;
  nodule:     number;
  boxes:       ScanBox[];
}

export type ScanPhase = 'camera' | 'loading' | 'result' | 'error';
export type AppPage = 'dashboard' | 'scan';
