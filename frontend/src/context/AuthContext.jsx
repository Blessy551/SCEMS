import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('scems_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: nextUser } = res.data.data;
    localStorage.setItem('scems_token', token);
    localStorage.setItem('scems_user', JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  };

  const register = async ({ name, email, password, department, role }) => {
    const path = role === 'HOD' ? '/auth/register/hod' : '/auth/register/organiser';
    const res = await api.post(path, { name, email, password, department });
    const { token, user: nextUser } = res.data.data;
    localStorage.setItem('scems_token', token);
    localStorage.setItem('scems_user', JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  };

  const logout = () => {
    localStorage.removeItem('scems_token');
    localStorage.removeItem('scems_user');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('scems_token');
    if (!token) return;

    setLoading(true);
    api.get('/auth/me')
      .then((res) => {
        setUser(res.data.data);
        localStorage.setItem('scems_user', JSON.stringify(res.data.data));
      })
      .catch(logout)
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user)
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
