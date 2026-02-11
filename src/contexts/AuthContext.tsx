import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiGet, apiPost } from '@/lib/api';

export type UserRole = 'admin' | 'analyst';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface ApiUser {
  id: number;
  email: string;
  full_name?: string | null;
  role: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const storedUser = localStorage.getItem('shelfiq_user');
      const token = localStorage.getItem('shelfiq_access_token');

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('shelfiq_user');
        }
      }

      if (token) {
        try {
          const me = await apiGet<ApiUser>('/auth/me');
          const mapped = {
            id: me.id,
            name: me.full_name || me.email,
            email: me.email,
            role: (me.role as UserRole) || 'analyst',
          } as User;
          setUser(mapped);
          localStorage.setItem('shelfiq_user', JSON.stringify(mapped));
        } catch {
          localStorage.removeItem('shelfiq_access_token');
          localStorage.removeItem('shelfiq_refresh_token');
        }
      }

      setIsLoading(false);
    };

    void bootstrap();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const tokens = await apiPost<LoginResponse, { email: string; password: string }>(
        '/auth/login',
        { email, password }
      );
      localStorage.setItem('shelfiq_access_token', tokens.access_token);
      localStorage.setItem('shelfiq_refresh_token', tokens.refresh_token);

      const me = await apiGet<ApiUser>('/auth/me');
      const mapped = {
        id: me.id,
        name: me.full_name || me.email,
        email: me.email,
        role: (me.role as UserRole) || 'analyst',
      } as User;
      setUser(mapped);
      localStorage.setItem('shelfiq_user', JSON.stringify(mapped));
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      await apiPost('/auth/register', {
        email,
        password,
        full_name: name,
      });
      return await login(email, password);
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shelfiq_user');
    localStorage.removeItem('shelfiq_access_token');
    localStorage.removeItem('shelfiq_refresh_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
