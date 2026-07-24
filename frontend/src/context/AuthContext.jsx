import React, { createContext, useState, useEffect, useContext } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('leaddesk_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await client.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error("Token verification failed:", err);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await client.post('/auth/login', { username, password });
      const accessToken = res.data.access_token;
      localStorage.setItem('leaddesk_token', accessToken);
      setToken(accessToken);
      
      // Fetch user profile
      const meRes = await client.get('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setUser(meRes.data);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Invalid login credentials';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('leaddesk_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
