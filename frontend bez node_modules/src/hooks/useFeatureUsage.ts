import { useEffect, useRef, useState } from 'react';

type AnalyticsPayload = {
  ts: number;
  scope: string;
  level: 'error';
  message: string;
  status?: number;
};

const POLL_MS = 15000;

export const useFeatureUsage = <T = unknown>(): T[] => {
  const [usage, setUsage] = useState<T[]>([]);
  const controllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<number | null>(null);

  const logError = (message: string, status?: number) => {
    const payload: AnalyticsPayload = {
      ts: Date.now(),
      scope: 'useFeatureUsage',
      level: 'error',
      message,
      status,
    };
    try {
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/log', blob); // ✅ FAZA 9 WDROŻONA
      } else {
        fetch('/api/analytics/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // ignore secondary logging errors
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchUsage = async () => {
      controllerRef.current?.abort();
      controllerRef.current = new AbortController();
      try {
        const res = await fetch('/api/usage', { signal: controllerRef.current.signal }); // ✅ FAZA 8 WDROŻONA
        if (!res.ok) {
          logError(`HTTP ${res.status} while fetching /api/usage`, res.status);
          return;
        }
        const data = await res.json();
        if (mounted && Array.isArray(data)) {
          setUsage(data as T[]);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown fetch error';
        logError(msg);
      }
    };

    fetchUsage();
    intervalRef.current = window.setInterval(fetchUsage, POLL_MS);

    return () => {
      mounted = false;
      controllerRef.current?.abort();
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return usage;
};
