// Auth context: holds the logged-in user and login/signup/logout helpers for the whole app.
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if a token is saved, ask the server who we are.
  useEffect(() => {
    if (!localStorage.getItem('token')) { setLoading(false); return; }
    api('/auth/me').then(setUser).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
  }, []);

  const authenticate = async (path, body) => {
    const { token, user } = await api(path, { method: 'POST', body });
    localStorage.setItem('token', token);
    setUser(user);
  };
  const login = (email, password) => authenticate('/auth/login', { email, password });
  const signup = (name, email, password) => authenticate('/auth/signup', { name, email, password });
  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  return <AuthCtx.Provider value={{ user, setUser, loading, login, signup, logout }}>{children}</AuthCtx.Provider>;
}
