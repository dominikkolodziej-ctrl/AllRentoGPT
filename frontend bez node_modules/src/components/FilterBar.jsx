// src/components/FilterBar.jsx
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';
import { offerCategories, sortOptions, voivodeships, radiusOptions } from '@/utils/constants.js';

const defaultFilters = {
  category: '',
  priceFrom: '',
  priceTo: '',
  voivodeship: '',
  radius: '',
  sort: '',
  promoted: false,
  highRated: false,
};

const FilterBar = ({
  filters = defaultFilters,
  onSearch,
  onEvent,
  className = '',
}) => {
  const { t } = useLiveText();
  const theme = useTheme();
  const classes = theme?.classes ?? {};
  const btnPrimary =
    classes.buttonPrimary ?? 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700';
  const btnSecondary =
    classes.buttonSecondary ?? 'bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400';
  const btnNeutral =
    classes.buttonNeutral ?? 'bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900';

  const [localFilters, setLocalFilters] = useState({ ...defaultFilters, ...filters });
  const [undoAvailable, setUndoAvailable] = useState(false);
  const prevFiltersRef = useRef(null);
  const undoTimerRef = useRef(null);

  useEffect(() => {
    setLocalFilters((prev) => ({ ...prev, ...filters }));
  }, [filters]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const handleChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggle = (field) => {
    setLocalFilters((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSearchClick = () => {
    onSearch?.(localFilters);
    onEvent?.('filters_search', { ...localFilters });
  };

  const handleReset = () => {
    prevFiltersRef.current = localFilters;
    const reset = { ...defaultFilters };
    setLocalFilters(reset);
    onSearch?.(reset);
    onEvent?.('filters_reset', { from: prevFiltersRef.current });
    setUndoAvailable(true);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setUndoAvailable(false), 5000);
  };

  const handleUndo = () => {
    if (!prevFiltersRef.current) return;
    const prev = prevFiltersRef.current;
    setLocalFilters(prev);
    onSearch?.(prev);
    onEvent?.('filters_reset_undone', { restored: prev });
    setUndoAvailable(false);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  };

  return (
    <div className={`flex flex-wrap gap-4 items-end mb-6 bg-white p-4 rounded-xl shadow ${className}`}>
      <div>
        <label htmlFor="filter-category" className="block text-sm font-medium text-gray-700">
          {t('Kategoria')}
        </label>
        <select
          id="filter-category"
          value={localFilters.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2"
          aria-label={t('Kategoria')}
        >
          <option value="">{t('Wszystkie')}</option>
          {offerCategories.map((cat) => (
            <option key={cat} value={cat}>
              {t(cat)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-voivodeship" className="block text-sm font-medium text-gray-700">
          {t('Województwo')}
        </label>
        <select
          id="filter-voivodeship"
          value={localFilters.voivodeship}
          onChange={(e) => handleChange('voivodeship', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2"
          aria-label={t('Województwo')}
        >
          <option value="">{t('Dowolne')}</option>
          {voivodeships.map((v) => (
            <option key={v} value={v}>
              {t(v)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-radius" className="block text-sm font-medium text-gray-700">
          {t('Promień (km)')}
        </label>
        <select
          id="filter-radius"
          value={localFilters.radius}
          onChange={(e) => handleChange('radius', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2"
          aria-label={t('Promień (km)')}
        >
          <option value="">{t('Dowolny')}</option>
          {radiusOptions.map((r) => (
            <option key={r} value={r}>
              {r} km
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-price-from" className="block text-sm font-medium text-gray-700">
          {t('Cena od')}
        </label>
        <input
          id="filter-price-from"
          type="number"
          value={localFilters.priceFrom}
          onChange={(e) => handleChange('priceFrom', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 w-32"
          placeholder={t('od')}
          aria-label={t('Cena od')}
          inputMode="numeric"
        />
      </div>

      <div>
        <label htmlFor="filter-price-to" className="block text-sm font-medium text-gray-700">
          {t('Cena do')}
        </label>
        <input
          id="filter-price-to"
          type="number"
          value={localFilters.priceTo}
          onChange={(e) => handleChange('priceTo', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 w-32"
          placeholder={t('do')}
          aria-label={t('Cena do')}
          inputMode="numeric"
        />
      </div>

      <div>
        <label htmlFor="filter-sort" className="block text-sm font-medium text-gray-700">
          {t('Sortuj')}
        </label>
        <select
          id="filter-sort"
          value={localFilters.sort}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2"
          aria-label={t('Sortuj')}
        >
          <option value="">{t('Domyślnie')}</option>
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.label)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="promoted"
          type="checkbox"
          checked={Boolean(localFilters.promoted)}
          onChange={() => handleToggle('promoted')}
          className="h-4 w-4"
        />
        <label htmlFor="promoted" className="text-sm text-gray-700">
          {t('Tylko promowane')}
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="highRated"
          type="checkbox"
          checked={Boolean(localFilters.highRated)}
          onChange={() => handleToggle('highRated')}
          className="h-4 w-4"
        />
        <label htmlFor="highRated" className="text-sm text-gray-700">
          {t('Wysoko oceniane')}
        </label>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={handleSearchClick} className={btnPrimary} type="button">
          {t('Szukaj')}
        </button>
        <button onClick={handleReset} className={btnSecondary} type="button">
          {t('Resetuj')}
        </button>
        {undoAvailable && (
          <button onClick={handleUndo} className={btnNeutral} type="button">
            {t('Cofnij reset')}
          </button>
        )}
      </div>
    </div>
  );
};

FilterBar.propTypes = {
  filters: PropTypes.shape({
    category: PropTypes.string,
    priceFrom: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    priceTo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    voivodeship: PropTypes.string,
    radius: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    sort: PropTypes.string,
    promoted: PropTypes.bool,
    highRated: PropTypes.bool,
  }),
  onSearch: PropTypes.func.isRequired,
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export default FilterBar;
