import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export interface AuthUser {
  sub: string;
  email: string;
  rol: string;
  empresaIds: string[];
  modulosPermitidos: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /** true si el usuario puede ver el módulo indicado (super_admin siempre puede). */
  canAccessModule: (moduleKey: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodeToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      sub: payload.sub,
      email: payload.email,
      rol: payload.rol,
      empresaIds: payload.empresaIds ?? [],
      modulosPermitidos: payload.modulosPermitidos ?? [],
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('dpo_token');
    if (token) setUser(decodeToken(token));
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const response = await apiFetch<{ accessToken: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('dpo_token', response.accessToken);
    setUser(response.user);
  }

  function logout() {
    localStorage.removeItem('dpo_token');
    setUser(null);
  }

  function canAccessModule(moduleKey: string) {
    if (!user) return false;
    if (user.rol === 'super_admin') return true;
    return user.modulosPermitidos.includes(moduleKey);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, canAccessModule }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
