import React from 'react'; // ✅ wymagane dla JSX
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1 – tłumaczenia
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 9 – motywy

export default function PlansPage_liveText_patch() {
  const t = useLiveText(); // ✅ FAZA 1 – tłumaczenia
  const { theme } = useTheme(); // ✅ FAZA 9 – motywy

  return (
    <section
      className={`${theme?.panelBg || 'bg-white'} ${theme?.textPrimary || 'text-gray-900'} p-6 rounded shadow`}
    >
      <h1 className="text-2xl font-bold mb-4">
        {t('plansPage.title') || 'Wybierz swój plan'}
      </h1>
      <p className={`${theme?.textSecondary || 'text-gray-600'} mb-6`}>
        {t('plansPage.subtitle') || 'Dopasuj plan do swoich potrzeb i budżetu.'}
      </p>
      {/* TODO: renderowanie listy planów po integracji z backendem */}
    </section>
  );
}