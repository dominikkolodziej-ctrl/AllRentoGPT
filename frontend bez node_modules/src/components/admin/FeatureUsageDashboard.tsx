// Ścieżka: src/components/Admin/FeatureUsageDashboard.tsx
import React, { useEffect, useState, useContext } from 'react';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1
import { ThemeContext } from '@/context/ThemeContext.jsx'; // ✅ FAZA 9
import axios from "axios";

const FeatureUsageDashboard = () => {
  const { t } = useLiveText();
  const { theme } = useContext(ThemeContext); // ✅ FAZA 9
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/admin/usage") // ✅ FAZA 8
      .then((res) => setUsage(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={`rounded shadow p-6 max-w-xl ${theme.bgCard} ${theme.textPrimary}`}> {/* ✅ FAZA 9 */}
      <h3 className="text-lg font-semibold mb-4">📊 {t("feature.usage.title")}</h3>

      {loading ? (
        <p className="text-sm text-gray-500 italic"> {/* ✅ FAZA 12 */}
          {t("loading") || "Ładowanie..."}
        </p>
      ) : usage.length === 0 ? (
        <p className="text-sm text-gray-400 italic"> {/* ✅ FAZA 12 */}
          {t("no.actions") || "Brak akcji"}
        </p>
      ) : (
        <ul className="text-sm space-y-2"> {/* ✅ FAZA 12 */}
          {usage.map((item, index) => (
            <li key={index}>
              <strong>{t(`feature.${item.feature}`)}</strong>: {item.count}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FeatureUsageDashboard;
