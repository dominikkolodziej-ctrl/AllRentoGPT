import { useCallback } from 'react';
import translations from '../locales/translations.json';
import { useLocale } from '../context/LocaleContext';

export const useTranslate = () => {
  const { locale } = useLocale();

  const t = useCallback((key, data = {}) => {
    const entry = Object.prototype.hasOwnProperty.call(translations, key) ? translations[key] : null;
    if (!entry) return key;

    let str;
    if (typeof entry === 'string') {
      str = entry;
    } else if (entry && typeof entry === 'object') {
      str = entry[locale] || entry.en || Object.values(entry)[0] || key;
    } else {
      str = key;
    }

    return String(str).replace(/\{\{(.*?)\}\}/g, (_, token) => {
      const v = data[token.trim()];
      return v === undefined || v === null ? '' : String(v);
    });
  }, [locale]); // ✅ FAZA 1 WDROŻONA

  return { t };
};

export default useTranslate;
