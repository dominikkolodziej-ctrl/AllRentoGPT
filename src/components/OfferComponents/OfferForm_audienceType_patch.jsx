import React from 'react'; // ✅ Wymagane dla JSX
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1 – tłumaczenia
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 9 – motywy

// ✅ FAZA 12 – status empty (placeholder komponentu)
export default function OfferForm_audienceType_patch() {
  const t = useLiveText; // ✅ FAZA 1 – tłumaczenia
  const { theme } = useTheme(); // ✅ FAZA 9 – motywy

  return (
    <div
      className={`${theme?.panelBg || 'bg-gray-50'} ${theme?.textSecondary || 'text-gray-500'} p-3 rounded-md`}
    >
      {t('offers.form.audienceType.empty') || 'Pole wyboru typu odbiorcy jest obecnie puste.'}
    </div>
  );
}