// src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const defaultTheme = {
  bgCard: 'bg-white',
  textPrimary: 'text-gray-900',
  labelColor: 'text-gray-700',
  fontFamily: 'font-sans',
  primary: '#10b981',
  background: 'bg-white',
  text: 'text-gray-900',
  border: 'border-gray-300',
  shadow: 'shadow-sm',
  radius: 'rounded-md',
  textInput:
    'w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
};

const defaultContext = {
  theme: defaultTheme,
  setTheme: () => {},
  isStaging: false,
  applyExternalTheme: () => {},
  // TODO [FAZA 12: mapowanie theme -> CSS variables]
};

export const ThemeContext = createContext(defaultContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);
  const [isStaging] = useState(import.meta.env.VITE_APP_ENV === 'staging');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('theme') ?? localStorage.getItem('themeConfig');
      if (raw) setTheme((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {
      // TODO [FAZA 12: obsługa błędu odczytu motywu z localStorage]
    }
  }, []);

  useEffect(() => {
    try {
      const payload = JSON.stringify(theme);
      localStorage.setItem('theme', payload);
      localStorage.setItem('themeConfig', payload); // kompatybilność wstecz
    } catch {
      // TODO [FAZA 12: obsługa błędu zapisu motywu do localStorage]
    }
  }, [theme]);

  const applyExternalTheme = (themeObject) => {
    if (!themeObject || typeof themeObject !== 'object') return;
    setTheme((prev) => ({ ...prev, ...themeObject }));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isStaging, applyExternalTheme }}>
      {isStaging && (
        <div style={{ background: '#6b21a8', color: 'white', textAlign: 'center' }}>STAGING MODE</div>
      )}
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

ThemeProvider.propTypes = {
  children: PropTypes.node,
};
