// src/context/LiveTextContext.jsx
import React, { useState, useEffect, useContext, createContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import rawTranslations from '../locales/translations.json';

const defaultLocale = 'pl';

// Normalizacja danych z translations.json do postaci: { pl: {key:value}, en: {...}, ... }
function normalizeTranslations(data) {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const langs = Object.keys(data);
    const looksLikeLangMap = langs.some(l => typeof data[l] === 'object');
    if (looksLikeLangMap) return data;
  }
  if (Array.isArray(data)) {
    const out = {};
    for (const row of data) {
      if (!row || typeof row !== 'object') continue;
      const k = row.key ?? row.Key ?? row.KEY;
      if (!k) continue;
      for (const [lang, val] of Object.entries(row)) {
        const isLang = typeof lang === 'string' && lang.length <= 5 && lang !== 'key' && lang !== 'Key' && lang !== 'KEY';
        if (!isLang) continue;
        out[lang] = out[lang] || {};
        out[lang][k] = typeof val === 'string' ? val : '';
      }
    }
    return out;
  }
  if (data && typeof data === 'object') {
    return { [defaultLocale]: data };
  }
  return { [defaultLocale]: {} };
}

const locales = normalizeTranslations(rawTranslations);

// 🔧 UJEDNOLICONY KSZTAŁT KONTEXTU – zawiera t, getText (alias), locale, lang (alias), setLocale
export const LiveTextContext = createContext({
  t: (key) => key,
  getText: (key) => key,
  locale: defaultLocale,
  lang: defaultLocale,
  setLocale: () => {},
});

export const LiveTextProvider = ({ children }) => {
  const getInitialLocale = () => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') : null;
      const nav = typeof navigator !== 'undefined' && navigator.language ? navigator.language.slice(0, 2) : defaultLocale;
      const candidate = stored || nav || defaultLocale;
      return locales[candidate] ? candidate : defaultLocale;
    } catch {
      return defaultLocale;
    }
  };

  const initialLocale = getInitialLocale();
  const [locale, setLocale] = useState(initialLocale);
  const [texts, setTexts] = useState(locales[initialLocale] || {});

  useEffect(() => {
    const lang = locales[locale] ? locale : defaultLocale;
    setTexts(locales[lang] || {});
    try {
      if (typeof window !== 'undefined') localStorage.setItem('locale', lang);
    } catch {
      /* ignore */
    }
  }, [locale]);

  const t = useMemo(() => {
    return (key) => {
      if (!key) return '';
      const cur = texts?.[key];
      if (typeof cur === 'string' && cur.length) return cur;
      const fallback = locales[defaultLocale]?.[key];
      return typeof fallback === 'string' && fallback.length ? fallback : key;
    };
  }, [texts]);

  // 🔧 Value zawiera aliasy zgodne z resztą kodu
  const value = useMemo(() => ({
    t,
    getText: t,        // alias dla kompatybilności
    locale,
    lang: locale,      // alias dla kompatybilności
    setLocale,
  }), [t, locale]);

  return (
    <LiveTextContext.Provider value={value}>
      {children}
    </LiveTextContext.Provider>
  );
};

LiveTextProvider.propTypes = {
  children: PropTypes.node,
};

// 🔧 DODANY brakujący eksport – używany w wielu miejscach
export const useLiveTextContext = () => useContext(LiveTextContext);

// Pozostawiamy istniejący hook, jeśli ktoś go używa z tego pliku
export const useLiveText = () => useContext(LiveTextContext);

export default LiveTextProvider;
