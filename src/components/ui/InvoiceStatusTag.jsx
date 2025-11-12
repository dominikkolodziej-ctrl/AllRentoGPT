import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';

const FALLBACK = {
  issued: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Wystawiona' },
  paid:   { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Opłacona'   },
  failed: { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Nieudana'   },
  draft:  { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'Szkic'      },
};

const InvoiceStatusTag = ({ status }) => {
  const { theme } = useTheme();
  const { t } = useLiveText?.() || { t: () => undefined };

  // Motywowe style (FAZA 9) z bezpiecznym fallbackiem
  const themed = theme?.invoiceStatus?.[status] || {};
  const bg = themed.bg || FALLBACK[status]?.bg || 'bg-gray-50';
  const text = themed.text || FALLBACK[status]?.text || 'text-gray-500';
  const extra = themed.classes || '';

  // Tłumaczenia (FAZA 1) z fallbackiem
  const label =
    t?.(`invoice.status.${status}`) ||
    FALLBACK[status]?.label ||
    status;

  return (
    <span className={clsx('px-2 py-1 rounded text-xs font-semibold', bg, text, extra)}>
      {label}
    </span>
  );
};

InvoiceStatusTag.propTypes = {
  status: PropTypes.oneOf(['issued', 'paid', 'failed', 'draft']).isRequired,
};

export default InvoiceStatusTag;

// ✅ FAZA 9 – motywy (theme.invoiceStatus[status].bg/text/classes)
// ✅ FAZA 1 – tłumaczenia (t('invoice.status.<status>') z fallbackiem)
