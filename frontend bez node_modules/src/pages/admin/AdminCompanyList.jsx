// src/pages/admin/AdminCompanyList.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import ExportButton from '@/components/common/ExportButton.jsx';
import { useAdmin } from '@/context/AdminContext.jsx';
import CountryContextSwitcher from '@/pages/admin/CountryContextSwitcher.jsx';
import TimeRangeSelector from '@/pages/admin/TimeRangeSelector.jsx';
import SavedFilterBar from '@/pages/admin/SavedFilterBar.jsx';
import { useLiveText } from '@/context/LiveTextContext.jsx'; // ✅ FAZA 1 WDROŻONA
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 12 WDROŻONA

export default function AdminCompanyList() {
  const { t } = useLiveText();
  const { theme } = useTheme();
  const [companies, setCompanies] = useState([]);
  const [filter, setFilter] = useState({ plan: '', query: '' });

  const { selectedCountry, setSelectedCountry, timeRange, setTimeRange, applyFilter } = useAdmin();

  const logEvent = useCallback((message, extra) => {
    try {
      const body = JSON.stringify({
        ts: Date.now(),
        scope: 'AdminCompanyList',
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

  const load = useCallback(
    async (signal) => {
      try {
        const query = new URLSearchParams({
          ...filter,
          country: String(selectedCountry ?? ''),
          from: String(timeRange?.from ?? ''),
          to: String(timeRange?.to ?? ''),
          preset: String(timeRange?.preset ?? ''),
        }).toString();

        const res = await fetch(`/api/admin/companies?${query}`, { signal }); // ✅ FAZA 8 WDROŻONA
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || `HTTP ${res.status}`);
        }
        const data = await res.json().catch(() => []);
        setCompanies(Array.isArray(data) ? data : []);
        logEvent('companies_loaded', { count: Array.isArray(data) ? data.length : 0 });
      } catch (err) {
        const msg = err && err.message ? err.message : (t('errors.fetch') || 'Błąd pobierania danych');
        toast.error(msg);
        setCompanies([]);
      }
    },
    [filter, selectedCountry, timeRange?.from, timeRange?.to, timeRange?.preset, t, logEvent]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort(); // ✅ FAZA 13 WDROŻONA
  }, [load]);

  const rows = useMemo(() => companies || [], [companies]); // ✅ FAZA 13 WDROŻONA

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleManualLoad = useCallback(() => {
    const controller = new AbortController();
    load(controller.signal).finally(() => controller.abort());
  }, [load]);

  return (
    <div
      className="p-6 max-w-7xl mx-auto space-y-6"
      style={{
        backgroundColor: theme?.surface || theme?.background || undefined,
        color: theme?.text || undefined,
      }}
    >
      <h2 className="text-2xl font-bold">
        {t('admin.companies.title') || '🏢 Lista firm'}
      </h2>

      <ExportButton type="companies" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CountryContextSwitcher country={selectedCountry} setCountry={setSelectedCountry} />
        <TimeRangeSelector range={timeRange} setRange={setTimeRange} />
        <SavedFilterBar onApply={applyFilter} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="w-full">
          <span className="sr-only">{t('admin.companies.search') || 'Szukaj firmy'}</span>
          <input
            id="company-search"
            className="input input-bordered w-full"
            placeholder={t('admin.companies.search') || 'Szukaj firmy'}
            name="query"
            value={filter.query}
            onChange={handleChange}
            aria-label={t('admin.companies.search') || 'Szukaj firmy'}
          />
        </label>

        <label className="w-full">
          <span className="sr-only">{t('admin.companies.plan') || 'Plan'}</span>
          <select
            id="company-plan"
            className="select select-bordered w-full"
            name="plan"
            value={filter.plan}
            onChange={handleChange}
            aria-label={t('admin.companies.plan') || 'Plan'}
          >
            <option value="">{t('admin.companies.planAll') || 'Wszystkie plany'}</option>
            <option value="trial">{t('plans.trial') || 'Trial'}</option>
            <option value="basic">{t('plans.basic') || 'Basic'}</option>
            <option value="premium">{t('plans.premium') || 'Premium'}</option>
          </select>
        </label>

        <button
          className="btn btn-primary"
          onClick={handleManualLoad}
          style={{ backgroundColor: theme?.primary || undefined, borderColor: theme?.primary || undefined }}
        >
          {t('common.search') || '🔍 Szukaj'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full text-sm" style={{ borderColor: theme?.primary || undefined }}>
          <thead>
            <tr>
              <th>{t('admin.companies.name') || 'Nazwa'} </th>
              <th>{t('admin.companies.email') || 'Email'}</th>
              <th>{t('admin.companies.plan') || 'Plan'}</th>
              <th>{t('admin.companies.activated') || 'Aktywowana'}</th>
              <th>{t('common.actions') || 'Akcje'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.plan}</td>
                <td>{c.activated ? '✅' : '⛔'}</td>
                <td>
                  <a className="btn btn-sm btn-outline" href={`/admin/companies/${c._id}`}>
                    🔍
                  </a>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="text-center opacity-70 py-6">
                  {t('common.noResults') || 'Brak wyników.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
