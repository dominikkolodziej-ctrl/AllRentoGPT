// src/pages/admin/BenchmarkCountryStats.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAdmin } from '@/context/AdminContext.jsx';
import TimeRangeSelector from '@/pages/admin/TimeRangeSelector.jsx';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/context/LiveTextContext.jsx';

export default function BenchmarkCountryStats() {
  const { theme } = useTheme();
  const { t } = useLiveText();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { timeRange, setTimeRange } = useAdmin();

  const logEvent = useCallback((message, extra) => {
    try {
      const body = JSON.stringify({
        ts: Date.now(),
        scope: 'BenchmarkCountryStats',
        level: 'info',
        message,
        ...(extra || {}),
      });
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/log', blob);
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
    const query = new URLSearchParams({
      from: String(timeRange?.from ?? ''),
      to: String(timeRange?.to ?? ''),
      preset: String(timeRange?.preset ?? ''),
    }).toString();

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/benchmark/countries?${query}`, { signal: controller.signal });
        const json = await res.json().catch(() => []);
        if (!res.ok) throw new Error((json && json.message) || `HTTP ${res.status}`);
        const rows = Array.isArray(json) ? json : [];
        setData(rows);
        logEvent('benchmark_countries_loaded', { count: rows.length });
      } catch {
        toast.error(t('admin.benchmark.fetchError') || 'Błąd pobierania statystyk');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [timeRange, t, logEvent]);

  const nf = useMemo(() => new Intl.NumberFormat(), []);
  const cf = useMemo(
    () => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }),
    []
  );
  const pf = useMemo(
    () => new Intl.NumberFormat(undefined, { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 0 }),
    []
  );

  const exportCSV = useCallback(() => {
    const rows = [
      [
        t('benchmark.country') || 'Kraj',
        t('benchmark.activeOffers') || 'Oferty aktywne',
        t('benchmark.avgRating') || 'Śr. ocena firm',
        t('benchmark.monthlyRevenue') || 'Przychód miesięczny',
        t('benchmark.promotedCTR') || 'CTR promowanych',
      ],
      ...data.map((r) => [
        r.countryLabel ?? r.countryCode ?? '',
        nf.format(Number(r.activeOffers || 0)),
        String(r.avgRating ?? ''),
        cf.format(Number(r.monthlyRevenue || 0)),
        pf.format(Number(r.promotedCTR || 0) / 100),
      ]),
    ];
    const csv = rows
      .map((r) =>
        r
          .map((v) => {
            const s = String(v ?? '');
            return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(';')
      )
      .join('\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'benchmark_countries.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  }, [data, t, nf, cf, pf]);

  return (
    <div
      className="p-6 max-w-7xl mx-auto space-y-6"
      style={{
        backgroundColor: theme?.surface || theme?.background || undefined,
        color: theme?.text || undefined,
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">
          {t('admin.benchmark.title') || '📊 Benchmark: Kraje vs. Kraje'}
        </h2>
        <button
          type="button"
          onClick={exportCSV}
          className="btn btn-primary"
          style={{ backgroundColor: theme?.primary || undefined, borderColor: theme?.primary || undefined }}
        >
          {t('common.exportCsv') || 'Eksport CSV'}
        </button>
      </div>

      <TimeRangeSelector range={timeRange} setRange={setTimeRange} />

      {loading ? (
        <p aria-busy="true">{t('common.loading') || 'Ładowanie...'}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full text-sm" style={{ borderColor: theme?.primary || undefined }}>
            <thead>
              <tr>
                <th>{t('benchmark.country') || 'Kraj'}</th>
                <th>{t('benchmark.activeOffers') || 'Oferty aktywne'}</th>
                <th>{t('benchmark.avgRating') || 'Śr. ocena firm'}</th>
                <th>{t('benchmark.monthlyRevenue') || 'Przychód miesięczny'}</th>
                <th>{t('benchmark.promotedCTR') || 'CTR promowanych'}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.countryCode || row.countryLabel}>
                  <td>{row.countryLabel}</td>
                  <td>{nf.format(Number(row.activeOffers || 0))}</td>
                  <td>{row.avgRating ?? '-'}</td>
                  <td>{cf.format(Number(row.monthlyRevenue || 0))}</td>
                  <td>{pf.format(Number(row.promotedCTR || 0) / 100)}</td>
                </tr>
              ))}
              {!data.length && (
                <tr>
                  <td colSpan={5} className="text-center opacity-70 py-6">
                    {t('common.noResults') || 'Brak wyników.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
