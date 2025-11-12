import { useState, useCallback } from 'react';
import axios from 'axios';

export const useTwoFactor = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logError = (message, extra) => {
    try {
      const body = JSON.stringify({
        ts: Date.now(),
        scope: 'useTwoFactor',
        level: 'error',
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

  const post = useCallback(async (url, payload) => {
    setLoading(true);
    try {
      const res = await axios.post(url, payload); // ✅ FAZA 8 WDROŻONA
      setError(null);
      return res && res.data !== undefined ? res.data : null;
    } catch (e) {
      const status = e && e.response && e.response.status;
      const msg = status ? `HTTP ${status} while POST ${url}` : (e && e.message) || 'Unknown error';
      setError(msg);
      logError(msg, { url });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendCode = useCallback(async (phone) => {
    await post('/api/2fa/send', { phone });
  }, [post]);

  const verifyCode = useCallback(async (phone, code) => {
    return await post('/api/2fa/verify', { phone, code });
  }, [post]);

  const reset2FA = useCallback(async (phone) => {
    await post('/api/2fa/reset', { phone });
  }, [post]);

  return { sendCode, verifyCode, reset2FA, loading, error };
};

export default useTwoFactor;
