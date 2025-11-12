import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";

const allOffers = [
  { id: 1, title: "Koparka JCB", location: "Warszawa", category: "Maszyny budowlane" },
  { id: 2, title: "Scena eventowa", location: "Kraków", category: "Eventy" },
  { id: 3, title: "Wózek widłowy", location: "Poznań", category: "Transport" },
];

const QuickFiltersHome = () => {
  const navigate = useNavigate();

  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;

  const ui = useMemo(
    () => ({
      grid: `grid grid-cols-1 md:grid-cols-5 gap-4 mt-6 ${theme?.classes?.grid || ""}`.trim(),
      input: "border p-2 rounded",
      rangeWrap: "flex gap-2",
      rangeInput: "border p-2 rounded w-1/2",
      btn: `bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition ${theme?.classes?.button || ""}`.trim(),
    }),
    [theme]
  );

  const [filters, setFilters] = useState({
    category: "",
    location: "",
    distance: "0",
    priceFrom: "",
    priceTo: "",
  });

  const categories = useMemo(
    () => Array.from(new Set(allOffers.map((o) => o.category))),
    []
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSearch = useCallback(() => {
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append("category", filters.category);
    if (filters.location) queryParams.append("location", filters.location);
    if (filters.distance) queryParams.append("distance", filters.distance);
    if (filters.priceFrom) queryParams.append("priceFrom", filters.priceFrom);
    if (filters.priceTo) queryParams.append("priceTo", filters.priceTo);

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob(
          [JSON.stringify({ type: "quick_filters_search", payload: { ...filters }, ts: Date.now() })],
          { type: "application/json" }
        )
      );
    }

    navigate(`/offers?${queryParams.toString()}`);
  }, [filters, navigate]);

  return (
    <div className={ui.grid} data-screen="quick-filters-home" data-theme={dataTheme}>
      <label className="sr-only" htmlFor="category">
        {t("filters.category", "Kategoria")}
      </label>
      <select
        id="category"
        name="category"
        onChange={handleChange}
        value={filters.category}
        className={ui.input}
        aria-label={t("filters.category", "Kategoria")}
      >
        <option value="">{t("filters.categoryAll", "Kategoria")}</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="location">
        {t("filters.location", "Lokalizacja")}
      </label>
      <input
        id="location"
        type="text"
        name="location"
        placeholder={t("filters.location", "Lokalizacja")}
        value={filters.location}
        onChange={handleChange}
        className={ui.input}
        aria-label={t("filters.location", "Lokalizacja")}
      />

      <label className="sr-only" htmlFor="distance">
        {t("filters.distance", "Odległość")}
      </label>
      <select
        id="distance"
        name="distance"
        onChange={handleChange}
        value={filters.distance}
        className={ui.input}
        aria-label={t("filters.distance", "Odległość")}
      >
        <option value="0">+0 km</option>
        <option value="5">+5 km</option>
        <option value="10">+10 km</option>
        <option value="25">+25 km</option>
        <option value="50">+50 km</option>
        <option value="75">+75 km</option>
      </select>

      <div className={ui.rangeWrap}>
        <label className="sr-only" htmlFor="priceFrom">
          {t("filters.priceFrom", "Cena od")}
        </label>
        <input
          id="priceFrom"
          type="number"
          name="priceFrom"
          placeholder={t("filters.priceFrom", "Cena od")}
          value={filters.priceFrom}
          onChange={handleChange}
          className={ui.rangeInput}
          aria-label={t("filters.priceFrom", "Cena od")}
          inputMode="numeric"
        />
        <label className="sr-only" htmlFor="priceTo">
          {t("filters.priceTo", "Cena do")}
        </label>
        <input
          id="priceTo"
          type="number"
          name="priceTo"
          placeholder={t("filters.priceTo", "Cena do")}
          value={filters.priceTo}
          onChange={handleChange}
          className={ui.rangeInput}
          aria-label={t("filters.priceTo", "Cena do")}
          inputMode="numeric"
        />
      </div>

      <button onClick={handleSearch} className={ui.btn} aria-label={t("filters.search", "Szukaj")}>
        {t("filters.search", "Szukaj")}
      </button>
    </div>
  );
};

export default QuickFiltersHome;
