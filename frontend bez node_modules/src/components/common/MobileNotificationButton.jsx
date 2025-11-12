import React from 'react';
import { useNotifications } from '@/hooks/useNotifications.js';

const MobileNotificationButton = () => {
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <button className="relative p-2">
      🔔
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default MobileNotificationButton;
