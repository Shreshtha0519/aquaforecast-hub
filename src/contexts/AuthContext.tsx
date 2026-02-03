import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

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
  loading: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (requiredRole: UserRole[]) => boolean;
}

type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Get role from localStorage (stored during signup/login)
        const storedRole = localStorage.getItem(`user_role_${firebaseUser.uid}`) as UserRole || 'viewer';
        
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          role: storedRole,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Store role in localStorage (in a real app, use Firestore)
      localStorage.setItem(`user_role_${userCredential.user.uid}`, role);
      return true;
    } catch (error: any) {
      console.error('Signup error:', error.message);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error: any) {
      console.error('Login error:', error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error.message);
    }
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    return user !== null && requiredRoles.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    loading,
    login,
    signup,
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
