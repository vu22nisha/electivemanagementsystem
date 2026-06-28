import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadUser(): AuthUser | null {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const displayName = localStorage.getItem('displayName');
  const userId = localStorage.getItem('userId');
  if (token && role && displayName && userId) {
    return { token, role: role as AuthUser['role'], displayName, userId };
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser);

  const login = (authUser: AuthUser) => {
    localStorage.setItem('token', authUser.token);
    localStorage.setItem('role', authUser.role);
    localStorage.setItem('displayName', authUser.displayName);
    localStorage.setItem('userId', authUser.userId);
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('displayName');
    localStorage.removeItem('userId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
