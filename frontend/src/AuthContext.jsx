import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from './api/auth.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('symposium_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('symposium_token');
      if (token && token !== 'undefined' && token !== 'null') {
        try {
          const res = await authApi.getMe();
          const userObj = res.user || res;
          setUser(userObj);
          localStorage.setItem('symposium_user', JSON.stringify(userObj));
        } catch (error) {
          console.error('Failed to fetch user on init:', error);
          localStorage.removeItem('symposium_token');
          localStorage.removeItem('symposium_user');
          setUser(null);
        }
      } else {
        localStorage.removeItem('symposium_token');
        localStorage.removeItem('symposium_user');
        setUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    const token = data.token || data.access_token;
    const userObj = data.user || data;

    if (!token) {
      throw new Error('Authentication failed: No token received.');
    }

    localStorage.setItem('symposium_token', token);
    localStorage.setItem('symposium_user', JSON.stringify(userObj));
    setUser(userObj);
    return userObj;
  };

  const signup = async (userData) => {
    const data = await authApi.signup(userData);
    const token = data.token || data.access_token;
    const userObj = data.user;

    if (token && userObj) {
      localStorage.setItem('symposium_token', token);
      localStorage.setItem('symposium_user', JSON.stringify(userObj));
      setUser(userObj);
      return userObj;
    }

    // Fallback login if token not in signup response
    return await login(userData.email, userData.password);
  };

  const logout = () => {
    localStorage.removeItem('symposium_token');
    localStorage.removeItem('symposium_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isOrganizer: user?.role === 'organizer',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
