import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1: Tłumaczenia
import { getCompanyStats } from "@/api/statsApi.js";
import CTRChart from "@/components/analytics/CTRChart.jsx";
import { useAIAlert } from "@/hooks/useAIAlert.js"; // ✅ FAZA 3: AI Alert

const CompanyStatsPanel = ({ companyId }) => {
  const t = useLiveText();
  const { aiVerified } = useAIAlert(); // Przykład wykorzystania FAZA 3
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ UX optymalizacja

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getCompanyStats(companyId);
        setStats(data);
      } catch (err) {
        console.error("Błąd pobierania statystyk firmy:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [companyId]);

  if (loading) return <p>{t("loadingData", "Ładowanie danych...")}</p>;
  if (!stats) return <p>{t("noData", "Brak danych do wyświetlenia")}</p>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        {t("companyStats", "Statystyki firmy")}
        {aiVerified && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">AI</span>}
      </h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-4">
          <p className="text-sm text-gray-500">{t("offerViews", "Wyświetlenia ofert")}</p>
          <p className="text-lg font-semibold">{stats.views}</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <p className="text-sm text-gray-500">{t("ctaClicks", "Liczba kliknięć CTA")}</p>
          <p className="text-lg font-semibold">{stats.clicks}</p>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <CTRChart data={stats.history} />
      </div>
    </div>
  );
};

CompanyStatsPanel.propTypes = {
  companyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default CompanyStatsPanel;
