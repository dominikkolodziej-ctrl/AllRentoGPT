// 📍 src/components/system/SystemStatusWidget.jsx (v2 ENTERPRISE)
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { cn } from '@/lib/utils.ts';

const StatusDot = ({ ok }) => (
  <span
    className={cn('inline-block w-2 h-2 rounded-full mr-2', ok ? 'bg-green-500' : 'bg-red-500')}
    aria-hidden="true"
  />
);

StatusDot.propTypes = {
  ok: PropTypes.bool,
};

export default function SystemStatusWidget() {
  const [status, setStatus] = useState({ api: true, db: true, uptime: 99.98 });

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/system/status', { signal: controller.signal });
        const data = await res.json();
        setStatus((prev) => ({ ...prev, ...data }));
      } catch {
        setStatus((prev) => ({ ...prev, api: false }));
      }
    })();
    return () => controller.abort();
  }, []);

  const uptimePct = Number.isFinite(Number(status.uptime)) ? Number(status.uptime).toFixed(2) : '--';

  return (
    <Card className="w-full max-w-sm" role="region" aria-label="Status systemu">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-2">Status systemu</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>
            <StatusDot ok={!!status.api} /> API: {status.api ? 'Online' : 'Offline'}
          </li>
          <li>
            <StatusDot ok={!!status.db} /> Baza danych: {status.db ? 'Działa' : 'Błąd'}
          </li>
          <li>
            <StatusDot ok /> Uptime: {uptimePct}%
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
