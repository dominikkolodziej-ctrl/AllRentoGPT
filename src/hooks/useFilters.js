// src/hooks/useFilters.js
import { useMemo, useState, useRef, useCallback } from "react";

/**
 * useFilters – enterprise
 * Pola: q, status, priceMin, priceMax, owner, tags[], onlyPublished, sort, page, limit
 * Zasady:
 * - każda zmiana filtra (poza page/sort/limit) resetuje page=1
 * - priceMin/priceMax normalizowane do liczb; gdy min>max -> zamiana
 */
export const useFilters = (initial = {}) => {
  const initialRef = useRef({
    q: "",
    status: "",
    priceMin: "",
    priceMax: "",
    owner: "",
    tags: [],
    onlyPublished: true,
    sort: "-updatedAt",
    page: 1,
    limit: 20,
    ...initial,
  });

  const [filters, setFilters] = useState(() => ({ ...initialRef.current }));

  // stabilna lista kluczy, które wpływają na zapytanie i resetują page
  const affectQueryKeysRef = useRef(
    new Set(["q", "status", "priceMin", "priceMax", "owner", "tags", "onlyPublished"])
  );

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (affectQueryKeysRef.current.has(key)) next.page = 1;
      return next;
    });
  }, []);

  const setMany = useCallback((patch) => {
    setFilters((prev) => {
      const next = { ...prev, ...(patch || {}) };
      const changedQueryKey = Object.keys(patch || {}).some((k) =>
        affectQueryKeysRef.current.has(k)
      );
      if (changedQueryKey) next.page = 1;
      return next;
    });
  }, []);

  const setPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page: Math.max(1, Number(page) || 1) }));
  }, []);

  const setSort = useCallback((sort) => {
    setFilters((prev) => ({ ...prev, sort }));
  }, []);

  const toggleTag = useCallback((tag) => {
    const t = String(tag || "").toLowerCase().trim();
    if (!t) return;
    setFilters((prev) => {
      const set = new Set((prev.tags || []).map((x) => String(x).toLowerCase()));
      if (set.has(t)) set.delete(t);
      else set.add(t);
      return { ...prev, tags: Array.from(set), page: 1 };
    });
  }, []);

  const clearTags = useCallback(() => {
    setFilters((prev) => ({ ...prev, tags: [], page: 1 }));
  }, []);

  // Normalizacja liczb i czyszczenie pustych wartości do zapytania BE
  const apiParams = useMemo(() => {
    const p = { ...filters };

    const toNum = (v) => (v === "" || v === null || v === undefined ? "" : Number(v));
    const min = toNum(p.priceMin);
    const max = toNum(p.priceMax);

    if (min !== "" && Number.isFinite(min)) p.priceMin = min;
    else delete p.priceMin;

    if (max !== "" && Number.isFinite(max)) p.priceMax = max;
    else delete p.priceMax;

    if (Number.isFinite(p.priceMin) && Number.isFinite(p.priceMax) && p.priceMin > p.priceMax) {
      const tmp = p.priceMin;
      p.priceMin = p.priceMax;
      p.priceMax = tmp;
    }

    Object.keys(p).forEach((k) => {
      const v = p[k];
      if (v === "" || v === null || v === undefined) delete p[k];
      if (Array.isArray(v) && v.length === 0) delete p[k];
    });

    return p;
  }, [filters]);

  const resetFilters = useCallback(() => {
    setFilters({ ...initialRef.current, page: 1 });
  }, []);

  return {
    filters,
    setFilters,
    setFilter,
    setMany,
    setPage,
    setSort,
    toggleTag,
    clearTags,
    resetFilters,
    apiParams,
  };
};

export default useFilters;
