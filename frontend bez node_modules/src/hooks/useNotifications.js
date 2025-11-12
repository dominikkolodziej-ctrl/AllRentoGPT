import { useEffect, useMemo, useState, useCallback } from 'react';

const STORAGE_KEY = 'notifications';

export const useNotifications = () => {
  const readStored = () => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) {
      void e;
      return [];
    }
  };

  const [notifications, setNotifications] = useState(readStored);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      void e; // ✅ FAZA 13 WDROŻONA
    }
  }, [notifications]);

  const makeId = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const addNotification = useCallback((message) => {
    const id = makeId();
    setNotifications((prev) => [...prev, { message, read: false, id }]);
    return id;
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  return useMemo(
    () => ({ notifications, addNotification, markAsRead, clearAll }),
    [notifications, addNotification, markAsRead, clearAll]
  );
};

export default useNotifications;
