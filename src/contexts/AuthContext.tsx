import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { LoginUser } from '@/types/auth';
import { getStoredToken, setStoredToken, clearStoredToken } from '@/lib/api-client';

const USER_KEY = 'fm_user';

function getStoredUser(): LoginUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as LoginUser) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user: LoginUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

type AuthContextValue = {
  user: LoginUser | null;
  token: string | null;
  login: (user: LoginUser, token: string) => void;
  logout: () => void;
  isReady: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const t = getStoredToken();
    const u = getStoredUser();
    if (t && u) {
      setToken(t);
      setUser(u);
    }
    setIsReady(true);
  }, []);

  const login = useCallback((u: LoginUser, t: string) => {
    setStoredToken(t);
    setStoredUser(u);
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const logoutRef = useRef(logout);
  logoutRef.current = logout;
  useEffect(() => {
    const onUnauthorized = () => {
      logoutRef.current();
    };
    window.addEventListener('fm:unauthorized', onUnauthorized);
    return () => window.removeEventListener('fm:unauthorized', onUnauthorized);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
