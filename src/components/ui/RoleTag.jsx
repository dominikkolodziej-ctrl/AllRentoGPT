import clsx from 'clsx';
import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';

const FALLBACK = {
  admin: { bg: 'bg-red-100', text: 'text-red-700', label: 'Administrator' },
  editor: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Redaktor' },
  viewer: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Podgląd' },
};

const RoleTag = ({ role }) => {
  const { theme } = useTheme();
  const { t } = useLiveText?.() || { t: () => undefined };

  const themed = theme?.roleTag?.[role] || {};
  const bg = themed.bg || FALLBACK[role]?.bg || 'bg-gray-100';
  const text = themed.text || FALLBACK[role]?.text || 'text-gray-600';
  const extra = themed.classes || '';

  const label =
    t?.(`roles.${role}`) ||
    FALLBACK[role]?.label ||
    role;

  return (
    <span
      className={clsx(
        'px-2 py-1 rounded text-xs font-medium',
        bg,
        text,
        extra
      )}
    >
      {label}
    </span>
  );
};

RoleTag.propTypes = {
  role: PropTypes.oneOf(['admin', 'editor', 'viewer']).isRequired,
};

export default RoleTag;

// ✅ FAZA 9 – motywy (theme.roleTag[role])
// ✅ FAZA 1 – tłumaczenia (t('roles.<role>') z fallbackiem)
