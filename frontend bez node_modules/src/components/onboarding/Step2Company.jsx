import PropTypes from 'prop-types';
import React from 'react';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1 – tłumaczenia
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 9 – motywy

export default function Step1Plan({ next }) {
  const { t } = useLiveText(); // ✅ FAZA 1 – tłumaczenia
  const { theme } = useTheme(); // ✅ FAZA 9 – motywy

  return (
    <div className={`${theme?.panelBg || ''} ${theme?.textPrimary || ''} p-4 rounded`}>
      <h2 className="text-xl font-bold mb-2">{t("onboarding.step1.title")}</h2>
      <p className="mb-4">{t("onboarding.step1.description")}</p>
      <button
        onClick={next}
        className={`${theme?.buttonPrimaryBg || 'bg-blue-600'} ${theme?.buttonPrimaryText || 'text-white'} px-4 py-2 rounded`}
      >
        {t("common.next")}
      </button>
    </div>
  );
}

Step1Plan.propTypes = {
  next: PropTypes.func.isRequired,
};
