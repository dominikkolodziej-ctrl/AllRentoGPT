import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1 – tłumaczenia
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 9 – motywy
import toast from 'react-hot-toast'; // ✅ FAZA 10 – obsługa błędów API

// ✅ FAZA 3 – AI Suggestion / Pricing / Scoring – POST /api/pricing/suggest
export default function PriceSuggestionPanel({ category, location }) {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useLiveText(); // ✅ FAZA 1 – tłumaczenia
  const { theme } = useTheme(); // ✅ FAZA 9 – motywy

  const fetchSuggestion = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pricing/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, location }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setSuggestion(data.price);
    } catch (error) {
      toast.error(t("pricing.suggestion.error") || "Błąd pobierania sugestii ceny");
      console.error("Price suggestion error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`p-4 rounded ${theme?.panelBg || 'bg-white'} ${theme?.border || 'border'} ${theme?.textPrimary || ''}`}
    >
      <h3 className="font-medium mb-2">{t("pricing.suggestion.title")}</h3>
      <button
        onClick={fetchSuggestion}
        disabled={loading}
        className={`${theme?.buttonPrimaryBg || 'bg-emerald-600'} ${theme?.buttonPrimaryText || 'text-white'} px-4 py-2 rounded text-sm disabled:opacity-50`}
      >
        {loading ? t("pricing.suggestion.loading") : t("pricing.suggestion.fetch")}
      </button>
      {suggestion && (
        <div className={`mt-3 text-sm ${theme?.textSecondary || 'text-gray-700'}`}>
          {t("pricing.suggestion.result")}: <strong>{suggestion} zł / {t("pricing.suggestion.perDay") || 'dzień'}</strong>
        </div>
      )}
    </div>
  );
}

PriceSuggestionPanel.propTypes = {
  category: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
};
