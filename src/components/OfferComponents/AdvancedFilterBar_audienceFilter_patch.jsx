import React from 'react'; // ✅ Naprawa błędu – React w scope dla JSX
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1 – tłumaczenia
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 9 – motywy

// ✅ FAZA 12 – status empty (placeholder komponentu)
export default function AdvancedFilterBar_audienceFilter_patch() {
  const t = useLiveText; // ✅ FAZA 1 – tłumaczenia
  const { theme } = useTheme(); // ✅ FAZA 9 – motywy

  return (
    <div
      className={`${theme?.panelBg || 'bg-gray-50'} ${theme?.textSecondary || 'text-gray-500'} p-4 rounded-md text-center`}
    >
      {t('filters.advanced.audience.empty') || 'Filtr odbiorców jest obecnie pusty.'}
    </div>
  );
}