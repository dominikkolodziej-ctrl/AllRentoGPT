import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1
import { useTheme } from '@/context/ThemeContext.jsx';               // ✅ FAZA 9

const categories = ["Koparki", "Wózki widłowe", "Biura", "Transport"];
const types = ["Wynajem", "Leasing", "Z operatorem"];

const AdvancedFilterBar = () => {
  const navigate = useNavigate();
  const { t } = useLiveText?.() || { t: (k) => k };
  const { theme } = useTheme() || {};

  const [category, setCategory] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [offerType, setOfferType] = useState("");
  const [promotedOnly, setPromotedOnly] = useState(false);

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (priceMin) params.append("minPrice", priceMin);
    if (priceMax) params.append("maxPrice", priceMax);
    if (offerType) params.append("type", offerType);
    if (promotedOnly) params.append("promoted", "true");

    navigate(`/offers?${params.toString()}`);
  };

  return (
    <div className={theme?.filterBarContainer || "bg-white rounded-xl shadow-md p-4 mt-6 flex flex-col gap-4"}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Kategoria */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={theme?.select || "border rounded-lg px-4 py-2 text-sm"}
        >
          <option value="">{t("filter.selectCategory") || "Wybierz kategorię"}</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {t(`category.${cat.toLowerCase().replace(/\s+/g, "_")}`) || cat}
            </option>
          ))}
        </select>

        {/* Cena od */}
        <input
          type="number"
          placeholder={t("filter.priceFrom") || "Cena od (zł)"}
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
          className={theme?.input || "border rounded-lg px-4 py-2 text-sm"}
        />

        {/* Cena do */}
        <input
          type="number"
          placeholder={t("filter.priceTo") || "Cena do (zł)"}
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          className={theme?.input || "border rounded-lg px-4 py-2 text-sm"}
        />

        {/* Typ oferty */}
        <select
          value={offerType}
          onChange={(e) => setOfferType(e.target.value)}
          className={theme?.select || "border rounded-lg px-4 py-2 text-sm"}
        >
          <option value="">{t("filter.offerType") || "Typ oferty"}</option>
          {types.map((tItem) => (
            <option key={tItem} value={tItem}>
              {t(`offerType.${tItem.toLowerCase().replace(/\s+/g, "_")}`) || tItem}
            </option>
          ))}
        </select>

        {/* Tylko promowane */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={promotedOnly}
            onChange={(e) => setPromotedOnly(e.target.checked)}
          />
          {t("filter.promotedOnly") || "Tylko promowane"}
        </label>
      </div>

      {/* Przycisk Szukaj */}
      <div className="text-right">
        <button
          onClick={handleFilter}
          className={theme?.primaryButton || "bg-blue-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-blue-700 transition"}
        >
          {t("filter.search") || "Szukaj"}
        </button>
      </div>
    </div>
  );
};

export default AdvancedFilterBar;

// ✅ FAZA 1: tłumaczenia dla wszystkich tekstów i placeholderów
// ✅ FAZA 9: pełne wsparcie ThemeContext (select, input, button, container)
