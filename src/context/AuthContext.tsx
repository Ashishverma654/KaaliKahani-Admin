'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setUser(null);
    router.push('/login');
  }, [router]);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLoading(false);
      if (pathname !== '/login') {
        router.push('/login');
      }
      return;
    }

    try {
      const response = await api.get('/auth/me');
      const userData = response.data.data;

      if (userData.role !== 'admin') {
        toast.error('Unauthorized: Admin access required');
        logout();
        return;
      }

      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout, pathname, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response received:', response.status);
      const { accessToken, user: userData } = response.data.data;

      if (userData.role !== 'admin') {
        console.warn('User is not an admin:', userData.role);
        toast.error('Access denied: You are not an admin');
        return;
      }

      localStorage.setItem('admin_token', accessToken);
      setUser(userData);
      toast.success('Welcome back, Admin!');
      router.push('/');
    } catch (error: any) {
      console.error('Detailed login error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
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
