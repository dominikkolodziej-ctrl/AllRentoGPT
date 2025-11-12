// src/hooks/useOfferSort.ts
import { useMemo, useState } from "react";

/**
 * Klucze sortowania zgodne z backendem:
 *  - "-updatedAt"  → najnowsze
 *  - "updatedAt"   → najstarsze
 *  - "title"       → tytuł A–Z
 *  - "-title"      → tytuł Z–A
 *  - "price"       → cena rosnąco  (opcjonalnie — jeśli wspiera BE)
 *  - "-price"      → cena malejąco (opcjonalnie — jeśli wspiera BE)
 */
export type OfferSortValue =
  | "-updatedAt"
  | "updatedAt"
  | "title"
  | "-title"
  | "price"
  | "-price";

export type SortOption = {
  value: OfferSortValue;
  /** klucz i18n, np. "sort.newest" */
  label: string;
  /** tekst zapasowy jeśli brak tłumaczenia */
  fallback: string;
};

const BASE_SORT_OPTIONS: SortOption[] = [
  { value: "-updatedAt", label: "sort.newest",    fallback: "Najnowsze" },
  { value: "updatedAt",  label: "sort.oldest",    fallback: "Najstarsze" },
  { value: "title",      label: "sort.titleAsc",  fallback: "Tytuł A–Z" },
  { value: "-title",     label: "sort.titleDesc", fallback: "Tytuł Z–A" },
  { value: "-price",     label: "sort.priceDesc", fallback: "Cena ↓" },
  { value: "price",      label: "sort.priceAsc",  fallback: "Cena ↑" },
];

type UseOfferSortOpts = {
  initial?: OfferSortValue;
  includePrice?: boolean; // ustaw na false jeśli BE nie wspiera sortowania po cenie
};

export function useOfferSort(opts: UseOfferSortOpts = {}) {
  const { initial = "-updatedAt", includePrice = true } = opts;
  const [sortKey, setSortKey] = useState<OfferSortValue>(initial);

  const sortOptions = useMemo<SortOption[]>(() => {
    if (includePrice) return BASE_SORT_OPTIONS;
    // odfiltruj price/-price jeśli nie chcemy ich pokazywać
    return BASE_SORT_OPTIONS.filter(
      (o) => o.value !== "price" && o.value !== "-price"
    );
  }, [includePrice]);

  // helper zwracający wartość przekazywaną 1:1 do BE
  const mapToApiSort = (v: OfferSortValue = sortKey) => v;

  return { sortKey, setSortKey, sortOptions, mapToApiSort };
}

export default useOfferSort;
