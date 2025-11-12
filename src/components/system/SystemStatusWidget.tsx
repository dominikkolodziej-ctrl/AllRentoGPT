import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

type HealthResponse = {
  ok: boolean;
  errorRate?: number | null;
};

type Props = {
  pollInterval?: number;
  healthUrl?: string;
  onEvent?: (name: string, data?: Record<string, unknown>) => void;
  className?: string;
};

const SystemStatusWidget: React.FC<Props> = ({
  pollInterval = 10000,
  healthUrl = '/api/health',
  onEvent,
  className = '',
}) => {
  const [status, setStatus] = useState<string>('🟡 Ładowanie...');
  const [errorRate, setErrorRate] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const { t } = useLiveText();

  type ThemeLike = { classes?: Record<string, string | undefined> } | null | undefined;
  const theme = useTheme() as ThemeLike;
  const classes: Record<string, string | undefined> = theme?.classes ?? {};
  const containerClass = classes.statusCard ?? 'bg-gray-100 p-4 rounded shadow max-w-xs text-sm';

  const intervalRef = useRef<number | null>(null);

  const labels = useMemo(
    () => ({
      label: t('system.status.label') || 'Status systemu',
      online: t('system.status.online') || '🟢 Online',
      offline: t('system.status.offline') || '🔴 Offline',
      connErr: t('system.status.connection_error') || '🔴 Błąd połączenia',
      ping: t('system.status.ping') || 'Ping',
      errors: t('system.status.errors') || 'Błędy',
    }),
    [t]
  );

  useEffect(() => {
    const controller = new AbortController();

    const checkHealth = async () => {
      const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
      try {
        const res = await fetch(healthUrl, { signal: controller.signal });
        const data: HealthResponse = await res.json();
        const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const rt = Math.round(end - start);
        setStatus(data.ok ? labels.online : labels.offline);
        setErrorRate(data.errorRate ?? null);
        setResponseTime(rt);
        onEvent?.('system_status_update', {
          ok: data.ok,
          errorRate: data.errorRate ?? null,
          responseTime: rt,
        });
      } catch {
        setStatus(labels.connErr);
        setResponseTime(null);
        onEvent?.('system_status_error');
      }
    };

    checkHealth();
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(checkHealth, pollInterval);

    return () => {
      controller.abort();
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [healthUrl, pollInterval, labels.online, labels.offline, labels.connErr, onEvent]);

  return (
    <div className={`${containerClass} ${className}`} role="status" aria-live="polite">
      <div>
        {labels.label}: <strong>{status}</strong>
      </div>
      {responseTime !== null && <div>⏱️ {labels.ping}: {responseTime} ms</div>}
      {errorRate !== null && <div>⚠️ {labels.errors}: {errorRate}%</div>}
    </div>
  );
};

export default SystemStatusWidget;
