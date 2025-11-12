import React, { memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const RADIUS_DEFAULT = 50;
const radiusOptions = [0, 5, 10, 25, 50, 75];

const TopSearchBar = ({ className = '', onEvent }) => {
  const navigate = useNavigate();
  const { t } = useLiveText();
  const { theme } = useTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(RADIUS_DEFAULT);

  const handleSearch = useCallback(() => {
    const hasText = !!searchTerm.trim();
    const hasFilters = !!location.trim() || radius !== RADIUS_DEFAULT;

    // Exclusive: either text OR filters
    if (hasText && hasFilters) {
      toast.error(t('search.error.exclusive') || 'Wybierz tylko frazę LUB filtry — nie można łączyć.');
      onEvent?.('top_search_error_exclusive');
      return;
    }

    if (hasText) {
      const params = new URLSearchParams();
      params.set('q', searchTerm.trim());
      onEvent?.('top_search_text', { q: searchTerm.trim() });
      navigate(`/offers?${params.toString()}`);
      return;
    }

    if (hasFilters) {
      const params = new URLSearchParams();
      if (location.trim()) params.set('location', location.trim());
      if (radius !== RADIUS_DEFAULT) params.set('radius', String(radius));
      onEvent?.('top_search_filters', { location: location.trim(), radius });
      navigate(`/offers?${params.toString()}`);
      return;
    }

    toast.error(t('search.error.empty') || 'Wpisz frazę lub ustaw lokalizację, aby wyszukać.');
    onEvent?.('top_search_error_empty');
  }, [searchTerm, location, radius, navigate, onEvent, t]);

  const containerCls = `bg-white shadow-md rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-center ${className}`;
  const inputCls = theme?.textInput ?? 'w-full sm:w-1/3 border rounded-xl px-4 py-2 text-sm';
  const selectCls = theme?.select ?? 'w-full sm:w-1/6 border rounded-xl px-4 py-2 text-sm';
  const btnCls =
    theme?.primaryButton ?? 'w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-blue-700 transition';

  const idQ = 'topsearch-q';
  const idLoc = 'topsearch-location';
  const idRad = 'topsearch-radius';

  return (
    <div className={containerCls} role="search" aria-label={t('search.bar') || 'Wyszukiwarka'}>
      <input
        id={idQ}
        type="text"
        name="q"
        placeholder={t('search.placeholder') || 'Czego szukasz? (np. koparka)'}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={inputCls}
        aria-label={t('search.placeholder') || 'Czego szukasz?'}
      />

      <input
        id={idLoc}
        type="text"
        name="location"
        placeholder={t('search.location') || 'Lokalizacja (opcjonalnie)'}
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className={inputCls}
        aria-label={t('search.location') || 'Lokalizacja'}
      />

      <select
        id={idRad}
        value={radius}
        onChange={(e) => setRadius(parseInt(e.target.value, 10))}
        className={selectCls}
        aria-label={t('search.radius') || 'Promień'}
      >
        {radiusOptions.map((r) => (
          <option key={r} value={r}>
            +{r} km
          </option>
        ))}
      </select>

      <button type="button" onClick={handleSearch} className={btnCls} aria-label={t('filters.search') || 'Szukaj'}>
        {t('filters.search') || 'Szukaj'}
      </button>
    </div>
  );
};

TopSearchBar.propTypes = {
  className: PropTypes.string,
  onEvent: PropTypes.func,
};

export default memo(TopSearchBar);
