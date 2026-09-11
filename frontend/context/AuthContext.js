'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || '/api' });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set token on axios header
  const applyToken = useCallback((t) => {
    if (t) {
      API.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    } else {
      delete API.defaults.headers.common['Authorization'];
    }
  }, []);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('canteen_token');
    const storedUser = localStorage.getItem('canteen_user');
    if (stored && storedUser) {
      setToken(stored);
      setUser(JSON.parse(storedUser));
      applyToken(stored);
      // Validate token is still good
      API.get('/auth/me', { headers: { Authorization: `Bearer ${stored}` } })
        .then((res) => setUser(res.data.user))
        .catch(() => { localStorage.removeItem('canteen_token'); localStorage.removeItem('canteen_user'); setUser(null); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [applyToken]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('canteen_token', t);
    localStorage.setItem('canteen_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    applyToken(t);
    return u;
  };

  const register = async (formData) => {
    const res = await API.post('/auth/register', formData);
    const { user: u } = res.data;
    // Removed auto-login logic
    return u;
  };

  const logout = () => {
    localStorage.removeItem('canteen_token');
    localStorage.removeItem('canteen_user');
    setUser(null);
    setToken(null);
    applyToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export { API };
