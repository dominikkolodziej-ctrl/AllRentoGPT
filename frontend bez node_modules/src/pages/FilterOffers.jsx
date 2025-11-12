import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";

const allOffers = [
  { id: 1, title: "Koparka JCB", location: "Warszawa", category: "Maszyny budowlane" },
  { id: 2, title: "Scena eventowa", location: "Kraków", category: "Eventy" },
  { id: 3, title: "Wózek widłowy", location: "Poznań", category: "Transport" },
];

const FilterOffers = () => {
  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;
  const ui = useMemo(
    () => ({
      page: `max-w-7xl mx-auto px-4 py-16 ${theme?.classes?.page || ""}`.trim(),
      title: "text-3xl md:text-5xl font-bold mb-8 text-center text-blue-700",
      input: "flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
      grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
      card: `border rounded-lg p-6 bg-white hover:shadow-lg transition ${theme?.classes?.card || ""}`.trim(),
      muted: `text-gray-500 ${theme?.classes?.mutedText || ""}`.trim(),
      small: "text-sm text-gray-400",
    }),
    [theme]
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = useMemo(
    () => Array.from(new Set(allOffers.map((offer) => offer.category))),
    []
  );

  const filteredOffers = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return allOffers.filter((offer) => {
      const matchesSearch = offer.title.toLowerCase().includes(s);
      const matchesCategory = selectedCategory ? offer.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob(
        [JSON.stringify({ type: "filter_offers_view", ts: Date.now() })],
        { type: "application/json" }
      );
      navigator.sendBeacon("/api/audit/event", blob);
    }
  }, []);

  return (
    <div className={ui.page} data-screen="filter-offers" data-theme={dataTheme}>
      <h1 className={ui.title}>{t("offers.searchTitle", "Wyszukaj Oferty")}</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <label htmlFor="search" className="sr-only">
          {t("offers.searchPlaceholder", "Czego szukasz?")}
        </label>
        <input
          id="search"
          type="text"
          placeholder={t("offers.searchPlaceholder", "Czego szukasz?")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={ui.input}
          aria-label={t("offers.searchAria", "Wyszukaj po tytule")}
        />

        <label htmlFor="category" className="sr-only">
          {t("offers.categoryFilter", "Kategoria")}
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={ui.input}
          aria-label={t("offers.categoryFilter", "Kategoria")}
        >
          <option value="">{t("offers.allCategories", "Wszystkie kategorie")}</option>
          {categories.map((category, idx) => (
            <option key={`${category}-${idx}`} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className={ui.grid}>
        {filteredOffers.length > 0 ? (
          filteredOffers.map((offer) => (
            <div key={offer.id} className={ui.card}>
              <h2 className="text-xl font-semibold text-blue-600">{offer.title}</h2>
              <p className={ui.muted}>{offer.location}</p>
              <p className={ui.small}>{offer.category}</p>
            </div>
          ))
        ) : (
          <p className={`${ui.muted} col-span-full text-center`}>
            {t("offers.noResults", "Brak ofert spełniających kryteria.")}
          </p>
        )}
      </div>
    </div>
  );
};

export default FilterOffers;
