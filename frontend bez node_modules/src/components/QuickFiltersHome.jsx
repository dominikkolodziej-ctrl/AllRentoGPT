import React, { memo, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const baseFilters = {
  category: '',
  location: '',
  distance: '0',
  priceFrom: '',
  priceTo: '',
};

const QuickFiltersHome = ({ initialFilters = {}, onEvent, className = '' }) => {
  const { t } = useLiveText();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ ...baseFilters, ...initialFilters });

  const inputCls =
    theme?.input ??
    'border p-2 rounded';
  const selectCls = theme?.select ?? 'border p-2 rounded';
  const btnCls =
    theme?.primaryButton ??
    'bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition';

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSearch = useCallback(() => {
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.distance) queryParams.append('distance', String(filters.distance));
    if (filters.priceFrom) queryParams.append('priceFrom', String(filters.priceFrom));
    if (filters.priceTo) queryParams.append('priceTo', String(filters.priceTo));

    const qs = queryParams.toString();
    onEvent?.('quick_filters_search', { ...filters, query: qs });
    navigate(`/offers?${qs}`);
  }, [filters, navigate, onEvent]);

  const categoryId = 'qh-category';
  const locationId = 'qh-location';
  const distanceId = 'qh-distance';
  const priceFromId = 'qh-price-from';
  const priceToId = 'qh-price-to';

  const categories = useMemo(
    () => [
      'Sprzęt budowlany',
      'Biura',
      'Transport',
      'IT',
      'Kontenery',
      'Powierzchnie',
      'Pojazdy',
    ],
    []
  );

  return (
    <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 mt-6 ${className}`}>
      <div>
        <label htmlFor={categoryId} className="sr-only">
          {t('filters.category') || 'Kategoria'}
        </label>
        <select
          id={categoryId}
          name="category"
          onChange={handleChange}
          value={filters.category}
          className={selectCls}
          aria-label={t('filters.category') || 'Kategoria'}
        >
          <option value="">{t('filters.category') || 'Kategoria'}...</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={locationId} className="sr-only">
          {t('filters.location') || 'Lokalizacja'}
        </label>
        <input
          id={locationId}
          type="text"
          name="location"
          placeholder={t('filters.location') || 'Lokalizacja'}
          value={filters.location}
          onChange={handleChange}
          className={inputCls}
          aria-label={t('filters.location') || 'Lokalizacja'}
        />
      </div>

      <div>
        <label htmlFor={distanceId} className="sr-only">
          {t('filters.distance') || 'Dystans'}
        </label>
        <select
          id={distanceId}
          name="distance"
          onChange={handleChange}
          value={filters.distance}
          className={selectCls}
          aria-label={t('filters.distance') || 'Dystans'}
        >
          <option value="0">+0 km</option>
          <option value="5">+5 km</option>
          <option value="10">+10 km</option>
          <option value="25">+25 km</option>
          <option value="50">+50 km</option>
          <option value="75">+75 km</option>
        </select>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor={priceFromId} className="sr-only">
            {t('filters.priceFrom') || 'Cena od'}
          </label>
          <input
            id={priceFromId}
            type="number"
            name="priceFrom"
            placeholder={t('filters.priceFrom') || 'Cena od'}
            value={filters.priceFrom}
            onChange={handleChange}
            className={`${inputCls} w-full`}
            inputMode="numeric"
            aria-label={t('filters.priceFrom') || 'Cena od'}
          />
        </div>
        <div className="flex-1">
          <label htmlFor={priceToId} className="sr-only">
            {t('filters.priceTo') || 'Cena do'}
          </label>
          <input
            id={priceToId}
            type="number"
            name="priceTo"
            placeholder={t('filters.priceTo') || 'Cena do'}
            value={filters.priceTo}
            onChange={handleChange}
            className={`${inputCls} w-full`}
            inputMode="numeric"
            aria-label={t('filters.priceTo') || 'Cena do'}
          />
        </div>
      </div>

      <div className="flex items-stretch">
        <button
          type="button"
          onClick={handleSearch}
          className={btnCls}
          aria-label={t('filters.search') || 'Szukaj'}
        >
          {t('filters.search') || 'Szukaj'}
        </button>
      </div>
    </div>
  );
};

QuickFiltersHome.propTypes = {
  initialFilters: PropTypes.shape({
    category: PropTypes.string,
    location: PropTypes.string,
    distance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    priceFrom: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    priceTo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export default memo(QuickFiltersHome);
