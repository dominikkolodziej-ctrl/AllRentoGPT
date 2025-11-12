// src/context/AdminContext.jsx
import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

const defaultValue = {
  selectedCountry: 'PL',
  setSelectedCountry: () => {},
  timeRange: { preset: 'last30', from: '', to: '' },
  setTimeRange: () => {},
  savedFilters: [],
  setSavedFilters: () => {},
  applyFilter: () => {},
  // TODO [FAZA 9: emit analytics on filter changes]
  // TODO [FAZA 10: provide export payload to CSV/XLSX]
};

const AdminContext = createContext(defaultValue);

export const useAdmin = () => useContext(AdminContext);

export function AdminProvider({ children }) {
  const [selectedCountry, setSelectedCountry] = useState('PL');
  const [timeRange, setTimeRange] = useState({ preset: 'last30', from: '', to: '' });
  const [savedFilters, setSavedFilters] = useState([]);

  const applyFilter = useCallback(
    (filter) => {
      if (filter === 'export') return { selectedCountry, timeRange }; // TODO [FAZA 10: trigger export]
      if (filter && typeof filter === 'object') {
        if (filter.selectedCountry) setSelectedCountry(filter.selectedCountry);
        if (filter.timeRange) setTimeRange(filter.timeRange);
        // TODO [FAZA 9: emit 'filter_applied' analytics event]
      }
      return undefined;
    },
    [selectedCountry, timeRange]
  );

  const value = useMemo(
    () => ({
      selectedCountry,
      setSelectedCountry,
      timeRange,
      setTimeRange,
      savedFilters,
      setSavedFilters,
      applyFilter,
    }),
    [selectedCountry, timeRange, savedFilters, applyFilter]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

AdminProvider.propTypes = {
  children: PropTypes.node,
};
