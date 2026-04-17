import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organizerRequestStatus: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          const userData = res.data.data.user;
          setUser(userData);

          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error("Auth sync failed", error);
          const storedUser = localStorage.getItem('user');
          if (storedUser) setUser(JSON.parse(storedUser));
          else logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      const userData = res.data.data.user;
      setUser(userData);

      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error("Refresh failed", error);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user: userData } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const googleLogin = async (googleToken: string) => {
    const response = await api.post('/auth/google', { credential: googleToken });
    const { token, user: userData } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string, role = 'USER') => {
    await api.post('/auth/register', { name, email, password, role });
    // Token is no longer returned upon registration as email verification is required.
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    googleLogin,
    register,
    logout,
    refreshUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
