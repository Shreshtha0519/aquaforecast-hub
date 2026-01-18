import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'analyst' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  hasPermission: (requiredRole: UserRole[]) => boolean;
}

type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string, role: UserRole): boolean => {
    if (email && password.length >= 4) {
      setUser({
        id: crypto.randomUUID(),
        name: email.split('@')[0],
        email,
        role,
      });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    return user !== null && requiredRoles.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    login,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
