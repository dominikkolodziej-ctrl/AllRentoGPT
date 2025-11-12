import React from 'react';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

export default function OfferCard_liveText_patch() {
  const { t } = useLiveText();
  const { theme } = useTheme();

  return (
    <div className={`${theme?.cardBg || 'bg-white'} ${theme?.textPrimary || 'text-gray-900'} p-4 rounded-lg shadow`}>
      <h3 className="text-lg font-semibold">
        {t('offers.card.title', 'Tytuł oferty')}
      </h3>
      <p className={`${theme?.textSecondary || 'text-gray-600'} text-sm`}>
        {t('offers.card.description', 'Opis oferty będzie wyświetlany tutaj.')}
      </p>
      <div className="mt-2 text-sm font-bold">
        {t('offers.card.price', 'Cena')}: 0 zł
      </div>
    </div>
  );
}
