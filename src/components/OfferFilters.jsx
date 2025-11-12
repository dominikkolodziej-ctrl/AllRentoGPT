// src/components/OfferFilters.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useLiveText } from "@/components/LiveTextCMS/useLiveText.js";
import { useTheme } from "@/context/ThemeContext.jsx";

/**
 * Enterprise OfferFilters – zgodne z BE /api/offer
 * Pola: q, status, priceMin, priceMax, owner, tags[], onlyPublished, (opcjonalnie) b2bOnly -> tag "b2b"
 *
 * Back-compat: działa z samym { filters, setFilters }. Jeśli podasz setFilter/setPage/toggleTag/clearTags,
 * component użyje ich preferencyjnie (lepsza ergonomia i reset page=1 na zmiany).
 */
export default function OfferFilters({
  filters,
  setFilters,
  setFilter,
  setPage,
  toggleTag,
  clearTags,
  className = "",
}) {
  const { t } = useLiveText();
  const { theme } = useTheme();

  const ui = useMemo(
    () => ({
      wrap: `${theme?.filtersContainer ?? ""} ${className}`.trim(),
      row: "flex flex-wrap items-center gap-2",
      label: theme?.label ?? "text-sm font-medium",
      input: theme?.input ?? "border rounded px-2 py-1",
      checkbox: theme?.checkbox ?? "h-4 w-4",
      tag: "text-xs px-2 py-1 rounded border",
      pill: "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border",
      btn: theme?.button ?? "px-3 py-1.5 border rounded",
      select: theme?.select ?? "border rounded px-2 py-1",
      hint: "text-xs text-gray-500",
    }),
    [theme, className]
  );

  // helpers (działają z samym setFilters)
  const setF = (k, v) => {
    if (typeof setFilter === "function") {
      setFilter(k, v);
      if (typeof setPage === "function") setPage(1);
    } else {
      setFilters((prev) => ({ ...prev, [k]: v, page: 1 }));
    }
  };

  const toggleTagLocal = (tag) => {
    const tg = String(tag || "").toLowerCase().trim(); // ⬅️ nazwa zmiennej zmieniona z "t" na "tg"
    if (!tg) return;
    if (typeof toggleTag === "function") {
      toggleTag(tg);
    } else {
      setFilters((prev) => {
        const set = new Set((prev.tags || []).map((x) => String(x).toLowerCase()));
        if (set.has(tg)) set.delete(tg); else set.add(tg);
        return { ...prev, tags: Array.from(set), page: 1 };
      });
    }
  };

  const clearTagsLocal = () => {
    if (typeof clearTags === "function") clearTags();
    else setFilters((prev) => ({ ...prev, tags: [], page: 1 }));
  };

  // b2bOnly <-> tag „b2b”
  const b2bOnly = Boolean(filters?.b2bOnly || (filters?.tags || []).includes("b2b"));
  const onB2BChange = (checked) => {
    // utrzymujemy b2bOnly w stanie lokalnym jeśli ktoś go używa w UI,
    // ale kluczowy jest tag 'b2b' dla BE.
    setF("b2bOnly", checked);
    const has = (filters?.tags || []).includes("b2b");
    if (checked && !has) toggleTagLocal("b2b");
    if (!checked && has) toggleTagLocal("b2b");
  };

  // tags input (comma separated)
  const tagsCSV = Array.isArray(filters?.tags) ? filters.tags.join(",") : "";
  const onTagsCSV = (val) => {
    const arr = val
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    setF("tags", arr);
  };

  return (
    <div className={ui.wrap} data-widget="offer-filters">
      {/* Row 1: Search + Status + OnlyPublished */}
      <div className={ui.row}>
        <label className={ui.label} htmlFor="f_q">
          {t("filters.search", "Szukaj")}
        </label>
        <input
          id="f_q"
          className={ui.input}
          type="search"
          value={filters?.q ?? ""}
          onChange={(e) => setF("q", e.target.value)}
          placeholder={t("filters.searchPh", "fraza, tytuł, słowa kluczowe")}
          aria-label={t("filters.searchAria", "Wyszukaj oferty")}
        />

        <label className={ui.label} htmlFor="f_status">
          {t("filters.status", "Status")}
        </label>
        <select
          id="f_status"
          className={ui.select}
          value={filters?.status ?? ""}
          onChange={(e) => setF("status", e.target.value)}
          aria-label={t("filters.statusAria", "Status oferty")}
        >
          <option value="">{t("filters.any", "Dowolny")}</option>
          <option value="draft">{t("filters.draft", "Szkic")}</option> {/* ⬅️ DODANE */}
          <option value="published">{t("filters.published", "Opublikowane")}</option>
          <option value="unlisted">{t("filters.unlisted", "Ukryte")}</option>
          <option value="archived">{t("filters.archived", "Zarchiwizowane")}</option>
        </select>

        <label className={ui.label} htmlFor="f_onlypub">
          {t("filters.onlyPublished", "Tylko publiczne")}
        </label>
        <input
          id="f_onlypub"
          type="checkbox"
          className={ui.checkbox}
          checked={Boolean(filters?.onlyPublished)}
          onChange={(e) => setF("onlyPublished", e.target.checked)}
        />
      </div>

      {/* Row 2: Price range + Owner */}
      <div className={ui.row}>
        <label className={ui.label} htmlFor="f_min">
          {t("filters.priceMin", "Cena od")}
        </label>
        <input
          id="f_min"
          className={ui.input}
          type="number"
          inputMode="numeric"
          value={filters?.priceMin ?? ""}
          onChange={(e) => setF("priceMin", e.target.value)}
          placeholder="0"
        />

        <label className={ui.label} htmlFor="f_max">
          {t("filters.priceMax", "Cena do")}
        </label>
        <input
          id="f_max"
          className={ui.input}
          type="number"
          inputMode="numeric"
          value={filters?.priceMax ?? ""}
          onChange={(e) => setF("priceMax", e.target.value)}
          placeholder="99999"
        />

        <label className={ui.label} htmlFor="f_owner">
          {t("filters.owner", "Właściciel (ID)")}
        </label>
        <input
          id="f_owner"
          className={ui.input}
          type="text"
          value={filters?.owner ?? ""}
          onChange={(e) => setF("owner", e.target.value)}
          placeholder="providerId"
        />
      </div>

      {/* Row 3: Tags + B2B */}
      <div className={ui.row}>
        <label className={ui.label} htmlFor="f_tags">
          {t("filters.tags", "Tagi")}
        </label>
        <input
          id="f_tags"
          className={ui.input}
          type="text"
          value={tagsCSV}
          onChange={(e) => onTagsCSV(e.target.value)}
          placeholder={t("filters.tagsPh", "np. diesel,pro")}
        />
        <button type="button" className={ui.btn} onClick={clearTagsLocal}>
          {t("filters.clearTags", "Wyczyść tagi")}
        </button>

        <input
          id="f_b2b"
          type="checkbox"
          className={ui.checkbox}
          checked={b2bOnly}
          onChange={(e) => onB2BChange(e.target.checked)}
        />
        <label htmlFor="f_b2b" className={ui.label}>
          {t("offer.b2bOnly.filter", "Tylko B2B")}
        </label>
        <span className={ui.hint}>
          {t("filters.b2bHint", "Dodaje/usuwa tag 'b2b'")}
        </span>
      </div>
    </div>
  );
}

OfferFilters.propTypes = {
  filters: PropTypes.shape({
    q: PropTypes.string,
    status: PropTypes.string,
    priceMin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    priceMax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    owner: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    onlyPublished: PropTypes.bool,
    b2bOnly: PropTypes.bool, // back-compat
  }),
  setFilters: PropTypes.func.isRequired,
  // opcjonalne, jeśli używasz useFilters helperów:
  setFilter: PropTypes.func,
  setPage: PropTypes.func,
  toggleTag: PropTypes.func,
  clearTags: PropTypes.func,
  className: PropTypes.string,
};
