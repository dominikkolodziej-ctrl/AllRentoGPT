import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const StripeStatusTag = ({ status, className = '' }) => {
  const { t } = useLiveText();
  const { theme } = useTheme();

  const normalized = String(status || '').toLowerCase();

  const label = useMemo(() => {
    switch (normalized) {
      case 'paid':
        return t('stripe.status.paid') || 'Opłacone';
      case 'pending':
        return t('stripe.status.pending') || 'Oczekuje';
      case 'failed':
        return t('stripe.status.failed') || 'Nieudane';
      case 'refunded':
        return t('stripe.status.refunded') || 'Zwrócone';
      default:
        return t(`stripe.status.${normalized}`) || status || 'Nieznany';
    }
  }, [normalized, status, t]);

  const colorCls = useMemo(() => {
    switch (normalized) {
      case 'paid':
        return theme?.badgeSuccess ?? 'bg-green-200 text-green-900';
      case 'pending':
        return theme?.badgeWarning ?? 'bg-yellow-200 text-yellow-900';
      case 'failed':
        return theme?.badgeError ?? 'bg-red-200 text-red-900';
      case 'refunded':
        return theme?.badgeInfo ?? 'bg-blue-200 text-blue-900';
      default:
        return theme?.badgeNeutral ?? 'bg-gray-200 text-gray-900';
    }
  }, [normalized, theme]);

  const baseCls =
    theme?.badge ??
    'inline-flex items-center px-2 py-1 rounded text-sm font-medium';

  return (
    <span
      className={clsx(baseCls, colorCls, className)}
      role="status"
      aria-label={`${t('stripe.status.label') || 'Status płatności'}: ${label}`}
    >
      {label}
    </span>
  );
};

StripeStatusTag.propTypes = {
  status: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default memo(StripeStatusTag);
