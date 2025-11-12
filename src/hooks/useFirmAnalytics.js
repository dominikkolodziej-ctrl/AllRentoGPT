import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export const useFirmAnalytics = () => {
  const [data, setData] = useState(null);
  const controllerRef = useRef(null);

  const logError = (message, status) => {
    try {
      const payload = {
        ts: Date.now(),
        scope: 'useFirmAnalytics',
        level: 'error',
        message,
        status,
      };
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
        }).catch(() => undefined);
      }
    } catch (e) {
      void e;
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;

    axios
      .get('/api/firm/benchmark', { signal: controller.signal }) // ✅ FAZA 8 WDROŻONA
      .then((res) => setData(res?.data ?? null))
      .catch((e) => {
        if (e?.name === 'CanceledError' || (axios.isCancel && axios.isCancel(e))) return; // ✅ FAZA 13 WDROŻONA
        const status = e?.response?.status;
        const msg = status ? `HTTP ${status} while fetching /api/firm/benchmark` : (e?.message || 'Unknown error');
        logError(msg, status);
      });

    return () => {
      controller.abort(); // ✅ FAZA 13 WDROŻONA
    };
  }, []);

  return data;
};

export default useFirmAnalytics;
