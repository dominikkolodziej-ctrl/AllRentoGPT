// Ścieżka: hooks/useAlerts.ts
import { useEffect, useRef, useState, useCallback } from 'react';

export type Alert = {
  id: string;
  message: string;
  read: boolean;
} & Record<string, unknown>;

const isAlert = (v: unknown): v is Alert =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as { id?: unknown }).id === 'string' &&
  typeof (v as { message?: unknown }).message === 'string' &&
  typeof (v as { read?: unknown }).read === 'boolean';

const toAlerts = (data: unknown): Alert[] => (Array.isArray(data) ? data.filter(isAlert) : []);

const useAlerts = (): { alerts: Alert[]; markAsRead: (id: string) => Promise<void> } => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchAlerts = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      const res = await fetch('/api/alerts', { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: unknown = await res.json();
      setAlerts(toAlerts(data));
    } catch {
      setAlerts([]);
    } finally {
      controllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    return () => controllerRef.current?.abort();
  }, [fetchAlerts]);

  const markAsRead = useCallback(async (id: string): Promise<void> => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // leave state unchanged on failure
    }
  }, []);

  return { alerts, markAsRead };
};

export default useAlerts;
