import { useState, useCallback, useMemo } from 'react';

export const useLocationSearch = () => {
  const [location, setLocation] = useState(null);

  const handleSelect = useCallback((locationData) => {
    setLocation(locationData);
  }, []); // ✅ FAZA 13 WDROŻONA

  return useMemo(
    () => ({
      location,
      setLocation,
      handleSelect,
    }),
    [location, handleSelect]
  ); // ✅ FAZA 13 WDROŻONA
};

export default useLocationSearch;
