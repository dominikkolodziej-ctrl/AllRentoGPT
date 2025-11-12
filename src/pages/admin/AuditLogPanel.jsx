import React, { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/context/LiveTextContext.jsx';
import LogEntry from '@/components/LogEntry.jsx';

const AuditLogPanel = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme(); // ✅ FAZA 12 WDROŻONA
  const { t } = useLiveText(); // ✅ FAZA 1 WDROŻONA

  const logEvent = useCallback((message, extra) => {
    try {
      const body = JSON.stringify({
        ts: Date.now(),
        scope: 'AuditLogPanel',
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
    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch('/api/audit/logs', { signal: controller.signal }); // ✅ FAZA 8 WDROŻONA
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json().catch(() => []);
        setLogs(Array.isArray(data) ? data : []);
        logEvent('audit_logs_loaded', { count: Array.isArray(data) ? data.length : 0 });
      } catch {
        import('@/api/mockLogsAPI')
          .then((mod) => {
            const getLogs = mod.getLogs || (mod.default && mod.default.getLogs);
            const data = typeof getLogs === 'function' ? getLogs() : [];
            setLogs(Array.isArray(data) ? data : []);
            logEvent('audit_logs_loaded_mock', { count: Array.isArray(data) ? data.length : 0 });
          })
          .catch(() => {
            setLogs([]);
            logEvent('audit_logs_load_failed');
          });
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort(); // ✅ FAZA 13 WDROŻONA
  }, [logEvent]);

  return (
    <div
      className="p-6"
      style={{
        backgroundColor: theme?.surface || theme?.background || undefined,
        color: theme?.text || undefined,
      }}
    >
      <h2 className="text-xl font-bold mb-4">
        {t('audit.title') || 'Logi audytowe'}
      </h2>
      {loading ? (
        <p aria-busy="true">{t('common.loading') || 'Ładowanie...'}</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log, idx) => (
            <LogEntry key={log.id || `${log.timestamp || ''}-${idx}`} {...log} />
          ))}
          {!logs.length && (
            <p className="opacity-70">{t('common.noResults') || 'Brak wyników.'}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogPanel;
