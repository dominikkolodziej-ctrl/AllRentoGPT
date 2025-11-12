import React from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useLiveText?.() || { t: (k) => k };

  const handleChange = (e) => {
    const selected = e.target.value;
    setTheme((prev) => ({ ...prev, name: selected }));
  };

  return (
    <select
      value={theme?.name || 'light'}
      onChange={handleChange}
      className="p-2 rounded border"
      aria-label={t('themeSwitcher.label') || 'Wybierz motyw'}
    >
      <option value="light">{t('themeSwitcher.light') || 'Light'}</option>
      <option value="dark">{t('themeSwitcher.dark') || 'Dark'}</option>
      <option value="corporate">{t('themeSwitcher.corporate') || 'Corporate'}</option>
    </select>
  );
};

export default ThemeSwitcher;

// ✅ FAZA 1 – tłumaczenia etykiet i opcji
// ✅ FAZA 9 – motywy (useTheme – zmiana motywu globalnego)
// 🔹 ESLint FIX – usunięty nieużywany import PropTypes
