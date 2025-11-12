import React from 'react'; // ✅ wymagane dla JSX
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1 – tłumaczenia
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 9 – motywy

export default function TopSearchBar_liveText_patch() {
  const t = useLiveText(); // ✅ FAZA 1 – tłumaczenia
  const { theme } = useTheme(); // ✅ FAZA 9 – motywy

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded ${theme?.panelBg || 'bg-white'} ${theme?.border || 'border border-gray-300'}`}
    >
      <input
        type="text"
        placeholder={t('search.placeholder') || 'Szukaj...'}
        className={`flex-1 p-2 rounded ${theme?.inputBg || 'bg-gray-50'} ${theme?.textPrimary || 'text-gray-900'} ${theme?.border || 'border-gray-300'}`}
      />
      <button
        className={`${theme?.buttonPrimaryBg || 'bg-blue-600'} ${theme?.buttonPrimaryText || 'text-white'} px-4 py-2 rounded`}
      >
        {t('search.button') || 'Szukaj'}
      </button>
    </div>
  );
}