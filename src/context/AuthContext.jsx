import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('paytrack_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data);
        } catch (err) {
          console.error('Session restore failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('paytrack_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return newUser;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to sign in. Please check credentials.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (name, email, password, company, phone, country) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', { name, email, password, company, phone, country });
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('paytrack_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return newUser;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('paytrack_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await api.put('/auth/profile', profileData);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Profile update failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, updateProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
