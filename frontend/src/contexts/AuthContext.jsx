import React, { createContext, useEffect, useState, useCallback } from 'react';
import api, { setAuthToken } from '../api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pft_token'));

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      api.get('/api/auth/me').then(r => setUser(r.data)).catch(()=>{ localStorage.removeItem('pft_token'); setToken(null); setUser(null); setAuthToken(null); });
    }
  }, [token]);

  const login = useCallback((token, user) => {
    localStorage.setItem('pft_token', token);
    setAuthToken(token);
    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pft_token');
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
