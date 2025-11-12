import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AlertTag from '@/components/common/AlertTag.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 9

const AdminAlertsPanel = () => {
  const { t } = useLiveText("admin");
  const { theme } = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null); // ✅ FAZA 10
  const [loading, setLoading] = useState(true); // ✅ FAZA 12

  useEffect(() => {
    axios.get('/api/alerts')
      .then(res => setAlerts(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={`p-6 space-y-3 ${theme.bgCard} ${theme.textPrimary}`}> {/* ✅ FAZA 9 */}
      <h2 className="text-xl font-bold mb-2">{t("alerts.title", "🕵️ Alerty AI")}</h2>

      {loading && <p>{t("loading", "Ładowanie...")}</p>} {/* ✅ FAZA 12 */}
      {error && <p className="text-red-500">{t("error.alerts", "Błąd pobierania alertów.")}</p>} {/* ✅ FAZA 10 */}
      {!loading && !error && alerts.length === 0 && (
        <p className="text-gray-500">{t("alerts.empty", "Brak aktywnych alertów.")}</p> // ✅ FAZA 12
      )}

      <ul className="space-y-2">
        {alerts.map((a) => (
          <li key={a.id} className="flex justify-between border p-2 rounded">
            <div>
              <div className="font-medium">{a.offerTitle}</div>
              <div className="text-sm text-gray-600">{a.reason}</div>
            </div>
            <AlertTag type={a.type} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminAlertsPanel;
