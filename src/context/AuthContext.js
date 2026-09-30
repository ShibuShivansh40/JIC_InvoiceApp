import React, { createContext, useState, useContext, useEffect } from 'react';
import { AUTH_USER, AUTH_PASS } from '../config';

const AuthContext = createContext();

const STORAGE_KEY = 'JIC_AUTH_SESSION_V1';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check saved session on app launch
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedSession = window.localStorage.getItem(STORAGE_KEY);
        if (savedSession === 'true') {
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      console.log('Session read error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (username, password) => {
    const trimmedUser = (username || '').trim();
    const expectedUser = (AUTH_USER || 'jeevesh-gupta').trim();
    const expectedPass = (AUTH_PASS || 'mybirthdayis@2810$').trim();

    if (trimmedUser === expectedUser && password === expectedPass) {
      setIsAuthenticated(true);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY, 'true');
        }
      } catch (e) {}
      return { success: true };
    } else {
      return { success: false, error: 'Invalid Username or Password' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
