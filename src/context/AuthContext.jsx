// src/context/AuthContext.jsx
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext({
  authUser: null,
  setAuthUser: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setAuthUser(null);
    // TODO [FAZA 5: wyczyść również refreshToken/sesję backend]
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('userId');
    const storedToken = localStorage.getItem('token');
    if (!storedUser || !storedToken) return;

    const controller = new AbortController();

    fetch(`/api/auth/user/${storedUser}`, {
      headers: { Authorization: `Bearer ${storedToken}` },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && data._id) setAuthUser(data);
        else logout();
      })
      .catch(() => {
        logout(); // TODO [FAZA 8: obsłuż 401 – redirect do login]
      });

    return () => controller.abort();
  }, [logout]);

  return <AuthContext.Provider value={{ authUser, setAuthUser, logout }}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export const useAuth = () => useContext(AuthContext);
