import React from 'react'; // ✅ wymagane dla JSX
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1 – tłumaczenia
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 9 – motywy

export default function DashboardHeader_liveText_patch() {
  const t = useLiveText(); // ✅ FAZA 1 – tłumaczenia
  const { theme } = useTheme(); // ✅ FAZA 9 – motywy

  return (
    <header
      className={`${theme?.panelBg || 'bg-white'} ${theme?.textPrimary || 'text-gray-900'} p-4 shadow`}
    >
      <h1 className="text-2xl font-bold">
        {t('dashboard.header.title') || 'Panel główny'}
      </h1>
      <p className={`${theme?.textSecondary || 'text-gray-600'} text-sm`}>
        {t('dashboard.header.subtitle') || 'Witamy w panelu administracyjnym'}
      </p>
    </header>
  );
}