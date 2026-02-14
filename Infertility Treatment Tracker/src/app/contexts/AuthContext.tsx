import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from '../api';

interface User {
  id: string;
  email: string;
  nickname: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nickname?: string, birthDate?: string, phone?: string, marketing?: { marketingEmail: boolean; marketingSms: boolean; marketingPush: boolean }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem('auth_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const result = await api.login(email, password);
    localStorage.setItem('auth_token', result.token);
    setUser(result.user);
  };

  const signup = async (email: string, password: string, nickname?: string, birthDate?: string, phone?: string, marketing?: { marketingEmail: boolean; marketingSms: boolean; marketingPush: boolean }) => {
    const result = await api.signup(email, password, nickname, birthDate, phone, marketing);
    localStorage.setItem('auth_token', result.token);
    setUser(result.user);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const refreshUser = async () => {
    const updated = await api.getMe();
    setUser(updated);
  };

  const deleteAccount = async (password?: string) => {
    await api.deleteAccount(password);
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
