import React from 'react';
import { useNotifications } from '@/hooks/useNotifications.js';

const NotificationBell = () => {
  const { notifications, markAsRead } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button type="button" className="relative px-3 py-1">
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>
      <div className="absolute bg-white border shadow mt-2 w-64 right-0 z-10">
        {notifications.length > 0 ? (
          notifications.map(n => (
            <button
              key={n.id}
              type="button"
              onClick={() => markAsRead(n.id)}
              className="w-full text-left p-2 border-b hover:bg-gray-100 cursor-pointer"
            >
              {n.message}
            </button>
          ))
        ) : (
          <div className="p-2 text-gray-500">Brak powiadomień</div>
        )}
      </div>
    </div>
  );
};

export default NotificationBell;
