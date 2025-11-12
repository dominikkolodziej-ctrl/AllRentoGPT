import React, { useCallback, useMemo, useState } from 'react';
import ExportButtonGroup from '@/components/Export/ExportButtonGroup.jsx';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/context/LiveTextContext.jsx';

const ExportDataPanel = () => {
  const { theme } = useTheme(); // ✅ FAZA 12 WDROŻONA
  const { t } = useLiveText(); // ✅ FAZA 1 WDROŻONA

  const [selected, setSelected] = useState(() => ({
    offers: true,
    companies: false,
    users: false,
    messages: false,
    alerts: false,
    plans: false,
  }));

  const logEvent = useCallback((message, extra) => {
    try {
      const body = JSON.stringify({
        ts: Date.now(),
        scope: 'ExportDataPanel',
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

  const labels = useMemo(
    () => ({
      offers: t('export.labels.offers') || 'Oferty',
      companies: t('export.labels.companies') || 'Firmy',
      users: t('export.labels.users') || 'Użytkownicy',
      messages: t('export.labels.messages') || 'Wiadomości',
      alerts: t('export.labels.alerts') || 'Alerty',
      plans: t('export.labels.plans') || 'Plany',
    }),
    [t]
  );

  const keys = useMemo(() => Object.keys(selected), [selected]); // ✅ FAZA 13 WDROŻONA

  const toggle = useCallback((key) => {
    setSelected((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      logEvent('export_toggle', { key, value: next[key] });
      return next;
    });
  }, [logEvent]); // ✅ FAZA 13 WDROŻONA

  return (
    <div
      className="p-6 max-w-4xl mx-auto space-y-6"
      style={{
        backgroundColor: theme?.surface || theme?.background || undefined,
        color: theme?.text || undefined,
      }}
    >
      <h2 className="text-2xl font-bold">{t('export.title') || '📤 Eksport danych'}</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {keys.map((key) => {
          const id = `export-${key}`;
          return (
            <label key={key} htmlFor={id} className="flex items-center gap-2">
              <input
                id={id}
                type="checkbox"
                checked={selected[key]}
                onChange={() => toggle(key)}
                aria-checked={selected[key]}
                style={{ accentColor: theme?.primary || undefined }}
              />
              <span>{labels[key] || key}</span>
            </label>
          );
        })}
      </div>

      <ExportButtonGroup selected={selected} /> {/* ✅ FAZA 10: integracja eksportu */}
    </div>
  );
};

export default ExportDataPanel;
