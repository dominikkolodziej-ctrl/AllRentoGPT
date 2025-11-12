import PropTypes from 'prop-types';
import React from 'react';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1 – tłumaczenia
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 9 – motywy

export default function Step4Preferences({ next, prev }) {
  const { t } = useLiveText(); // ✅ FAZA 1 – tłumaczenia
  const { theme } = useTheme(); // ✅ FAZA 9 – motywy

  return (
    <div className={`${theme?.panelBg || ''} ${theme?.textPrimary || ''} p-4 rounded space-y-4`}>
      <h2 className="text-xl font-bold">{t("onboarding.step4.title")}</h2>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className={`${theme?.border || 'border-gray-300'} rounded`}
        />
        {t("onboarding.preferences.b2bOnly")}
      </label>
      <div className="flex justify-between pt-4">
        <button
          onClick={prev}
          className={`${theme?.buttonSecondaryBg || 'bg-gray-300'} ${theme?.buttonSecondaryText || 'text-black'} px-4 py-2 rounded`}
        >
          {t("common.back")}
        </button>
        <button
          onClick={next}
          className={`${theme?.buttonPrimaryBg || 'bg-blue-600'} ${theme?.buttonPrimaryText || 'text-white'} px-4 py-2 rounded`}
        >
          {t("common.next")}
        </button>
      </div>
    </div>
  );
}

Step4Preferences.propTypes = {
  next: PropTypes.func.isRequired,
  prev: PropTypes.func.isRequired,
};
