import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  utn_id?: string;
  phone?: string;
}

interface Wallet {
  id: string;
  balance: number;
  currency_symbol: string;
}

interface AuthContextType {
  user: User | null;
  wallet: Wallet | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  // Derived state for authentication status
  const isAuthenticated = !!user;
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setWallet(data.wallet);
      } else {
        logout();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) {
      refreshProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    // Refresh to get wallet immediately
    setTimeout(refreshProfile, 100);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setWallet(null);
  };

  return (
    <AuthContext.Provider value={{ user, wallet, token, isLoading, login, logout, refreshProfile, isAuthenticated }}>
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
