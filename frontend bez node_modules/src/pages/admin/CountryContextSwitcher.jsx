import PropTypes from 'prop-types';

// src/components/admin/CountryContextSwitcher.jsx

import React from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/context/LiveTextContext.jsx';

const countries = [
  { code: 'PL', label: 'Polska 🇵🇱' },
  { code: 'DE', label: 'Niemcy 🇩🇪' },
  { code: 'FR', label: 'Francja 🇫🇷' },
  { code: 'ES', label: 'Hiszpania 🇪🇸' },
  { code: 'US', label: 'USA 🇺🇸' },
];

export default function CountryContextSwitcher({ country, setCountry }) {
  const { theme } = useTheme(); // ✅ FAZA 12 WDROŻONA
  const { t } = useLiveText(); // ✅ FAZA 1 WDROŻONA
  const selectId = 'country-context-select';

  return (
    <div
      className="form-control w-full max-w-xs"
      style={{ color: theme?.text || undefined }}
    >
      <label className="label" htmlFor={selectId}>
        <span className="label-text">
          {t('admin.countryContext.label') || '🌍 Kontekst kraju'}
        </span>
      </label>
      <select
        id={selectId}
        className="select select-bordered"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        aria-label={t('admin.countryContext.label') || 'Kontekst kraju'}
        style={{ borderColor: theme?.primary || undefined }}
      >
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}

CountryContextSwitcher.propTypes = {
  country: PropTypes.string.isRequired,
  setCountry: PropTypes.func.isRequired,
};
