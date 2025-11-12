import React, { memo, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const LogEntry = ({ user, action, timestamp, onEvent, className = '' }) => {
  const { t } = useLiveText();
  const theme = useTheme();
  const classes = theme?.classes ?? {};

  const container = classes.card ?? 'p-3 rounded shadow-sm border';
  const title = classes.cardTitle ?? 'font-semibold';
  const text = classes.text ?? '';
  const muted = classes.muted ?? 'text-gray-500';

  const displayUser = typeof user === 'string' ? user : user?.name ?? '';

  const formattedTime = useMemo(() => {
    if (timestamp == null) return '';
    const d =
      timestamp instanceof Date
        ? timestamp
        : typeof timestamp === 'number'
        ? new Date(timestamp)
        : new Date(String(timestamp));
    return Number.isNaN(d.getTime())
      ? String(timestamp)
      : new Intl.DateTimeFormat('pl-PL', { dateStyle: 'short', timeStyle: 'short' }).format(d);
  }, [timestamp]);

  useEffect(() => {
    onEvent?.('log_entry_view', { user: displayUser, action, timestamp });
  }, [onEvent, displayUser, action, timestamp]);

  return (
    <div className={clsx(container, className)} role="article" aria-label={t('Wpis logu')}>
      <p className={title}>{displayUser}</p>
      <p className={text}>{t(action)}</p>
      <small className={muted}>{formattedTime}</small>
    </div>
  );
};

LogEntry.propTypes = {
  user: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ name: PropTypes.string })]).isRequired,
  action: PropTypes.string.isRequired,
  timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]).isRequired,
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export default memo(LogEntry);
