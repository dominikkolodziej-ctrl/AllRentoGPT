import React, { useCallback, useEffect, useMemo, useState } from 'react';

// src/pages/admin/ContractArchiveAdmin.jsx

import toast from 'react-hot-toast';
import { useAdmin } from '@/context/AdminContext.jsx';
import CountryContextSwitcher from '@/pages/admin/CountryContextSwitcher.jsx';
import TimeRangeSelector from '@/pages/admin/TimeRangeSelector.jsx';
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 12 WDROŻONA
import { useLiveText } from '@/context/LiveTextContext.jsx'; // ✅ FAZA 1 WDROŻONA

export default function ContractArchiveAdmin() {
  const { theme } = useTheme();
  const { t } = useLiveText();

  const [contracts, setContracts] = useState([]);
  const [filters, setFilters] = useState({ status: '', company: '' });
  const [loading, setLoading] = useState(true);

  const { selectedCountry, timeRange, setTimeRange, setSelectedCountry } = useAdmin();

  const statusLabel = useCallback(
    (s) => {
      if (s === 'pending') return t('contracts.status.pending') || 'Oczekuje';
      if (s === 'signed') return t('contracts.status.signed') || 'Podpisana';
      if (s === 'rejected') return t('contracts.status.rejected') || 'Odrzucona';
      if (s === 'expired') return t('contracts.status.expired') || 'Wygasła';
      return s || '-';
    },
    [t]
  );

  const loadContracts = useCallback(
    async (signal) => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          status: String(filters.status || ''),
          company: String(filters.company || ''),
          country: String(selectedCountry || ''),
          from: String(timeRange?.from || ''),
          to: String(timeRange?.to || ''),
          preset: String(timeRange?.preset || ''),
        }).toString();

        const res = await fetch(`/api/admin/contracts?${query}`, { signal }); // ✅ FAZA 8 WDROŻONA
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error((data && data.message) || `HTTP ${res.status}`);
        setContracts(Array.isArray(data) ? data : []);
      } catch {
        toast.error(t('admin.contracts.fetchError') || 'Błąd pobierania umów');
        setContracts([]);
      } finally {
        setLoading(false);
      }
    },
    [filters.status, filters.company, selectedCountry, timeRange?.from, timeRange?.to, timeRange?.preset, t]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadContracts(controller.signal);
    return () => controller.abort(); // ✅ FAZA 13 WDROŻONA
  }, [loadContracts]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleManualFilter = useCallback(() => {
    const controller = new AbortController();
    loadContracts(controller.signal).finally(() => controller.abort());
  }, [loadContracts]);

  const rows = useMemo(() => contracts || [], [contracts]); // ✅ FAZA 13 WDROŻONA

  return (
    <div
      className="p-6 max-w-7xl mx-auto"
      style={{
        backgroundColor: theme?.surface || theme?.background || undefined,
        color: theme?.text || undefined,
      }}
    >
      <h2 className="text-2xl font-bold mb-4">
        {t('admin.contracts.archiveTitle') || '📄 Archiwum umów (Administrator)'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <CountryContextSwitcher country={selectedCountry} setCountry={setSelectedCountry} />
        <TimeRangeSelector range={timeRange} setRange={setTimeRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <label className="w-full">
          <span className="sr-only">{t('admin.contracts.company') || 'Firma'}</span>
          <input
            name="company"
            className="input input-bordered w-full"
            placeholder={t('admin.contracts.company') || 'Firma'}
            value={filters.company}
            onChange={handleChange}
            aria-label={t('admin.contracts.company') || 'Firma'}
          />
        </label>

        <label className="w-full">
          <span className="sr-only">{t('admin.contracts.status') || 'Status'}</span>
          <select
            name="status"
            className="select select-bordered w-full"
            value={filters.status}
            onChange={handleChange}
            aria-label={t('admin.contracts.status') || 'Status'}
          >
            <option value="">{t('common.allStatuses') || 'Wszystkie statusy'}</option>
            <option value="pending">{statusLabel('pending')}</option>
            <option value="signed">{statusLabel('signed')}</option>
            <option value="rejected">{statusLabel('rejected')}</option>
            <option value="expired">{statusLabel('expired')}</option>
          </select>
        </label>

        <button
          className="btn btn-primary"
          onClick={handleManualFilter}
          style={{ backgroundColor: theme?.primary || undefined, borderColor: theme?.primary || undefined }}
        >
          {t('common.search') || '🔍 Filtruj'}
        </button>
      </div>

      {loading ? (
        <p aria-busy="true">{t('common.loading') || 'Ładowanie...'}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full text-sm" style={{ borderColor: theme?.primary || undefined }}>
            <thead>
              <tr>
                <th>{t('admin.contracts.table.company') || 'Firma'}</th>
                <th>{t('admin.contracts.table.client') || 'Klient'}</th>
                <th>{t('admin.contracts.table.status') || 'Status'}</th>
                <th>{t('admin.contracts.table.date') || 'Data'}</th>
                <th>{t('common.actions') || 'Akcje'}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c._id}>
                  <td>{c.companyName}</td>
                  <td>{c.clientEmail}</td>
                  <td>{statusLabel(c.status)}</td>
                  <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>
                  <td>
                    <a
                      className="btn btn-sm btn-outline"
                      href={`/contracts/pdf/${c._id}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ borderColor: theme?.primary || undefined, color: theme?.primary || undefined }}
                    >
                      PDF
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
      )}
    </div>
  );
}
