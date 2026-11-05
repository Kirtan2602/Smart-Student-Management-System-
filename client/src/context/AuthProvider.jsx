import { useEffect, useState } from 'react';
import { AuthContext } from './authContext';
import api, {
  refreshSession,
  setAccessToken,
  setAuthFailureHandler,
} from '../services/api';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Refresh pan fail thay to user ne logout karo
    setAuthFailureHandler(() => setUser(null));

    // Page reload par cookie thi session pacho melvo
    let active = true;
    refreshSession()
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setAccessToken(res.data.data.accessToken);
    setUser(res.data.data.user);
    return res.data.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Server error hoy to pan local logout to karvu j
    }
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}