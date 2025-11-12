import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '@/context/AuthContext.jsx';
import { getContractsForUser } from '@/api/contractApi';
import { useNavigate } from 'react-router-dom';
import { useLiveText } from '@/context/LiveTextContext.jsx';
import { useTheme } from '@/context/ThemeContext.jsx';

export default function ContractWidget() {
  const { user } = useContext(AuthContext);
  const { t } = useLiveText();
  const { theme } = useTheme(); // ✅ FAZA 12 WDROŻONA
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();

  const trackEvent = useCallback((message, extra) => {
    try {
      const body = JSON.stringify({
        ts: Date.now(),
        scope: 'ContractWidget',
        level: 'info',
        message,
        ...(extra || {}),
      });
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
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!user?._id) return;
    getContractsForUser(user._id) // ✅ FAZA 8 WDROŻONA
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;
        const count = data.filter((c) => c.status === 'pending').length;
        setPendingCount(count);
      })
      .catch(() => {
        if (mounted) setPendingCount(0);
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  if (!user) return null;

  const title = t('contracts.widget.title') || 'Umowy do podpisania';
  const message =
    pendingCount > 0
      ? `Masz ${pendingCount} oczekując${pendingCount === 1 ? 'ą' : 'e'} umow${
          pendingCount === 1 ? 'ę' : 'y'
        }`
      : t('contracts.widget.none') || 'Brak nowych umów do podpisu';

  const handleClick = () => {
    trackEvent('contract_widget_click', { pendingCount });
    navigate('/contracts/viewer');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full text-left p-4 border-l-4 rounded shadow cursor-pointer focus:outline-none focus:ring-2"
      aria-label={title}
      style={{
        backgroundColor: theme?.surface || theme?.background || undefined,
        color: theme?.text || undefined,
        borderLeftColor: theme?.primary || undefined,
      }}
    >
      <h3 className="font-semibold mb-1" style={{ color: theme?.text || undefined }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: theme?.text || undefined }}>
        {message}
      </p>
    </button>
  );
}
