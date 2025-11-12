import { useEffect, useState, useMemo, useCallback } from 'react';

const STORAGE_KEY = 'favorites';

const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    let saved = [];
    if (raw) {
      try {
        saved = JSON.parse(raw);
      } catch {
        saved = [];
      }
    }
    if (Array.isArray(saved)) setFavorites(saved);
  }, []);

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]); // TODO [FAZA 13: memoizacja]

  const toggleFavorite = useCallback((offerId) => {
    setFavorites((prev) => {
      const exists = prev.includes(offerId);
      const updated = exists ? prev.filter((id) => id !== offerId) : [...prev, offerId];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); // TODO [FAZA 10: fallback persist, gdy localStorage niedostępny]
      }
      return updated;
    });
  }, []);

  const isFavorite = useCallback((offerId) => favoritesSet.has(offerId), [favoritesSet]);

  return { favorites, toggleFavorite, isFavorite };
};

export default useFavorites;
