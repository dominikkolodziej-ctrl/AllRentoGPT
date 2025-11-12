import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useAlertScanner } from "@/hooks/useAlertScanner";
import { ThemeContext } from "@/context/ThemeContext.jsx"; // ✅ poprawiono literówkę

// ✅ FAZA 1: useLiveText() wdrożony
// ✅ FAZA 3: useAlertScanner() = AI Alert logic
// ✅ FAZA 1: theme (bgCard, textPrimary)

const AlertDashboard = ({ offers }) => {
  const { t } = useLiveText();
  const alerts = useAlertScanner(offers);
  const { theme } = useContext(ThemeContext); // ✅ poprawiono literówkę

  if (!alerts.length) return <p className={theme.textPrimary}>{t("no_alerts")}</p>;

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`border p-4 rounded ${theme.bgCard} ${theme.textPrimary}`}
        >
          <h4 className="font-bold">{alert.title}</h4>
          <ul className="list-disc ml-6 text-sm text-red-700">
            {alert.issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

AlertDashboard.propTypes = {
  offers: PropTypes.array.isRequired,
};

export default AlertDashboard;
