import { useEffect, useState } from 'react';
import axios from 'axios';

const HEALTH_URL = '/api/status/healthcheck';

export const useSystemStatus = () => {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let mounted = true;
    let controller = new AbortController();
    let intervalId = null;

    const logEvent = (message, extra) => {
      try {
        const body = JSON.stringify({
          ts: Date.now(),
          scope: 'useSystemStatus',
          level: 'info',
          message,
          ...(extra || {}),
        });
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          const blob = new Blob([body], { type: 'application/json' });
          navigator.sendBeacon('/api/analytics/log', blob); // ✅ FAZA 9 WDROŻONA
        } else {
          fetch('/api/analytics/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
          }).catch(() => undefined);
        }
      } catch {
        /* ignore */
      }
    };

    const normalize = (s) => {
      const v = typeof s === 'string' ? s.toLowerCase() : '';
      if (v === 'ok' || v === 'up') return 'ok';
      if (v === 'degraded') return 'degraded';
      return 'down';
    };

    const check = async () => {
      try {
        controller.abort();
      } catch {
        /* ignore */
      }
      controller = new AbortController();
      try {
        const res = await axios.get(HEALTH_URL, { signal: controller.signal }); // ✅ FAZA 8 WDROŻONA
        const next = normalize(res && res.data && res.data.status);
        if (!mounted) return;
        setStatus((prev) => {
          if (prev !== next) logEvent('status_changed', { from: prev, to: next });
          return next;
        });
      } catch {
        if (!mounted) return;
        setStatus((prev) => {
          if (prev !== 'down') logEvent('status_changed', { from: prev, to: 'down' });
          return 'down';
        });
      }
    };

    check();
    intervalId = setInterval(check, 60000); // ✅ FAZA 13 WDROŻONA

    return () => {
      mounted = false;
      try {
        controller.abort();
      } catch {
        /* ignore */
      }
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return status;
};
