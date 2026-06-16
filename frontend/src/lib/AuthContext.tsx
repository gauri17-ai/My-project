'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  getStoredUser, 
  setStoredUser, 
  setAccessToken, 
  setStoredRefreshToken, 
  getStoredRefreshToken,
  apiFetch
} from './api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize Auth from local storage / try to refresh token once on start
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = getStoredUser();
      const refreshToken = getStoredRefreshToken();

      if (storedUser && refreshToken) {
        setUser(storedUser);
        
        // Try to refresh token on startup to get a fresh access token
        try {
          const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
          const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
          });

          if (res.ok) {
            const result = await res.json();
            if (result.success && result.data.access_token) {
              setAccessToken(result.data.access_token);
              setStoredRefreshToken(result.data.refresh_token);
            }
          } else {
            // Revoked token, clear user
            setUser(null);
            setStoredUser(null);
            setStoredRefreshToken(null);
          }
        } catch (e) {
          // If network fails, keep stored user (offline capability)
          console.error('Failed auto-refresh on mount:', e);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (res.success && res.data) {
        setAccessToken(res.data.access_token);
        setStoredRefreshToken(res.data.refresh_token);
        setStoredUser(res.data.user);
        setUser(res.data.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    setLoading(true);
    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ full_name: fullName, email, password })
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        }).catch(() => {});
      }
    } finally {
      setAccessToken(null);
      setStoredRefreshToken(null);
      setStoredUser(null);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
