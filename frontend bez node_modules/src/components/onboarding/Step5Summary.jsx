import React from 'react';
import PropTypes from 'prop-types';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1 – tłumaczenia
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 9 – motywy
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast'; // ✅ FAZA 10 – obsługa błędów z powiadomieniem

export default function Step5Summary({ prev, onComplete }) {
  const { t } = useLiveText(); // ✅ FAZA 1 – tłumaczenia
  const { theme } = useTheme(); // ✅ FAZA 9 – motywy
  const navigate = useNavigate();

  const handleFinish = async () => {
    try {
      const payload = {
        companyName: "Firma Testowa",
        companyNip: "1234567890",
        industry: "IT",
        audienceType: "B2B",
        plan: "Pro",
        themeColor: "#0033cc",
        logoUrl: "/uploads/logo.png"
      };

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (onComplete) onComplete(); // ✅ FAZA 6 – wywołanie zakończenia
        navigate("/dashboard");
        toast.success(t('onboarding.completed') || 'Onboarding zakończony pomyślnie');
      } else {
        toast.error(t('onboarding.error') || 'Błąd podczas zapisu onboardingu');
        console.error("Błąd podczas zapisu onboardingu");
      }
    } catch (e) {
      toast.error(t('onboarding.error') || 'Błąd podczas zapisu onboardingu');
      console.error("Wyjątek:", e);
    }
  };

  return (
    <div className={`${theme?.panelBg || ''} ${theme?.textPrimary || ''} p-4 rounded`}>
      <h2 className="text-xl font-bold mb-2">{t("onboarding.step5.title")}</h2>
      <p className="mb-4">{t("onboarding.step5.description")}</p>
      <div className="flex justify-between">
        <button
          onClick={prev}
          className={`${theme?.buttonSecondaryBg || 'bg-gray-300'} ${theme?.buttonSecondaryText || 'text-black'} px-4 py-2 rounded`}
        >
          {t("common.back")}
        </button>
        <button
          onClick={handleFinish}
          className={`${theme?.buttonPrimaryBg || 'bg-blue-600'} ${theme?.buttonPrimaryText || 'text-white'} px-4 py-2 rounded`}
        >
          {t("common.finish")}
        </button>
      </div>
    </div>
  );
}

Step5Summary.propTypes = {
  prev: PropTypes.func.isRequired,
  onComplete: PropTypes.func,
};
