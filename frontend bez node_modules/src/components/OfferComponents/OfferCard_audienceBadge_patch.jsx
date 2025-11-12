import React from 'react';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

export default function OfferCard_audienceBadge_patch() {
  const { t } = useLiveText();
  const { theme } = useTheme();

  return (
    <span className={`${theme?.badge || 'inline-block px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800'}`}>
      {t('offer.audience.badge', 'Audience')}
    </span>
  );
}
