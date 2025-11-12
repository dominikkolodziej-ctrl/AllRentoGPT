// src/context/LocaleContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const defaultValue = { locale: 'en', switchLocale: () => {} };
const LocaleContext = createContext(defaultValue);

export const useLocale = () => useContext(LocaleContext);

const getDefaultLocale = () => {
  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') : null;
    if (stored) return stored;
    const nav = typeof navigator !== 'undefined' && navigator.language ? navigator.language.slice(0, 2) : 'en';
    return nav.startsWith('pl') ? 'pl' : 'en';
  } catch {
    return 'en';
  }
};

export const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = useState(getDefaultLocale);

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') : null;
      if (stored) setLocale(stored);
    } catch {
      // ignore storage read errors
    }
  }, []);

  const switchLocale = useCallback((lang) => {
    setLocale(lang);
    try {
      if (typeof window !== 'undefined') localStorage.setItem('locale', lang);
    } catch {
      // ignore storage write errors
    }
    // TODO [FAZA 1: zsynchronizować z LiveTextContext.setLocale]
  }, []);

  return <LocaleContext.Provider value={{ locale, switchLocale }}>{children}</LocaleContext.Provider>;
};

LocaleProvider.propTypes = {
  children: PropTypes.node,
};
