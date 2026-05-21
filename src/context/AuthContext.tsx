'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// ── Tipos ────────────────────────────────────────────────────
export interface AuthUser {
  id?: number | string;
  nombre?: string;
  apellido?: string;
  email?: string;
  tipoPersona?: string;
  escuelaId?: number | string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  /** true tras el primer check de localStorage (evita redirects prematuros) */
  isInitialized: boolean;
  login: (token: string, refreshToken: string, user: AuthUser, rememberMe?: boolean) => void;
  logout: () => void;
  /** Actualiza access_token y refresh_token tras un refresh exitoso */
  updateTokens: (accessToken: string, refreshToken: string) => void;
  /** Etiqueta legible del rol (ej. "maestro" → "Profesor") */
  roleLabel: string;
  /** Nombre completo o fallback */
  displayName: string;
}

// ── Mapa de roles ─────────────────────────────────────────────
const ROLE_MAP: Record<string, string> = {
  administrador: 'Administrador',
  director: 'Director',
  maestro: 'Profesor',
  padre: 'Tutor',
  alumno: 'Estudiante',
};

// ── Context ───────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar desde localStorage al montar
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken) setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    } finally {
      setIsInitialized(true);
    }
  }, []);

  /**
   * Llamar al hacer login exitoso.
   * rememberMe=true  → refresh_token dura 50 días (el back ya lo maneja, nosotros solo guardamos)
   * rememberMe=false → refresh_token dura 2 días
   */
  const login = (newToken: string, newRefreshToken: string, newUser: AuthUser, rememberMe = false) => {
    setToken(newToken);
    setUser(newUser);

    localStorage.setItem('token', newToken);
    localStorage.setItem('refresh_token', newRefreshToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    // Cookie del access_token para el middleware de Next.js (RouteGuard)
    // Si rememberMe, 50 días; si no, sesión (se borra al cerrar browser)
    if (rememberMe) {
      Cookies.set('token', newToken, { expires: 50 });
    } else {
      Cookies.set('token', newToken); // sesión
    }
  };

  /** Llamar tras un refresh exitoso — actualiza solo los tokens sin tocar al user */
  const updateTokens = (accessToken: string, refreshToken: string) => {
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    Cookies.set('token', accessToken);
  };

  /** Llamar al cerrar sesión */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    Cookies.remove('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
    router.refresh();
  };

  const tipo = user?.tipoPersona?.toLowerCase().trim() ?? '';
  const roleLabel = ROLE_MAP[tipo] ?? (user?.tipoPersona ?? 'Usuario');
  const displayName =
    [user?.nombre, user?.apellido].filter(Boolean).join(' ').trim() || 'Usuario';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isInitialized,
        login,
        logout,
        updateTokens,
        roleLabel,
        displayName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}