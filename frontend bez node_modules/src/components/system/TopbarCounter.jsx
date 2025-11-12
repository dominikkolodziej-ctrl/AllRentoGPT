// 📍 src/components/system/TopbarCounter.jsx (v2 ENTERPRISE – ESLint FIX #2)
import React, { useEffect, useState, useContext, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils.ts';

import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';
import { NotificationContext } from '@/context/NotificationContext';
import { Tooltip } from '@/components/ui/tooltip';

export default function TopbarCounter({ onEvent, className = '' }) {
  const ctx = useContext(NotificationContext) || {};
  const { unreadCount = 0, fetchNotifications, subscribeToNotifications } = ctx;

  const [pulse, setPulse] = useState(false);
  const router = useRouter();
  const { t } = useLiveText();
  const { theme } = useTheme();

  useEffect(() => {
    let intervalId = null;
    const run = async () => {
      try {
        await fetchNotifications?.();
        onEvent?.('notifications_fetch');
      } catch {
        toast.error(t('notifications.fetchError') || 'Błąd pobierania powiadomień');
        onEvent?.('notifications_fetch_error');
      }
    };
    run();
    if (fetchNotifications) {
      intervalId = setInterval(run, 30000);
    }
    const unsubscribe = subscribeToNotifications?.();
    return () => {
      if (intervalId) clearInterval(intervalId);
      unsubscribe?.();
    };
  }, [fetchNotifications, subscribeToNotifications, t, onEvent]);

  useEffect(() => {
    if (unreadCount > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  const handleClick = useCallback(() => {
    router.push('/notifications');
    onEvent?.('notifications_open_click');
  }, [router, onEvent]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  const tooltipText = useMemo(() => {
    const unread = t('notifications.unread') || 'Masz';
    const items = t('notifications.items') || 'powiadomień';
    return `${unread} ${unreadCount} ${items}`;
  }, [t, unreadCount]);

  return (
    <Tooltip content={tooltipText}>
      <div
        role="button"
        tabIndex={0}
        aria-label={t('notifications.open') || 'Otwórz powiadomienia'}
        className={cn('relative cursor-pointer', className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <Bell
          className={cn(
            'w-5 h-5 transition-colors',
            theme?.iconMuted || 'text-muted-foreground',
            theme?.iconHover || 'hover:text-primary',
            unreadCount > 0 && (theme?.dangerText || 'text-red-600')
          )}
        />
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] leading-4 rounded-full flex items-center justify-center',
              theme?.badgeDangerBg || 'bg-red-600',
              theme?.badgeText || 'text-white',
              pulse && 'animate-ping'
            )}
          >
            {unreadCount}
          </span>
        )}
      </div>
    </Tooltip>
  );
}

TopbarCounter.propTypes = {
  onEvent: PropTypes.func,
  className: PropTypes.string,
};
