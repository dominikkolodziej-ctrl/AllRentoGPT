// src/modules/admin/AdminBillingPanel.jsx – panel subskrypcji (admin)
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import StripeStatusTag from '@/components/StripeStatusTag.jsx';
import InvoiceList from '@/pages/admin/InvoiceList.jsx';
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 12 WDROŻONA
import { useLiveText } from '@/context/LiveTextContext.jsx'; // ✅ FAZA 1 WDROŻONA

export default function AdminBillingPanel() {
  const { theme } = useTheme();
  const { t } = useLiveText();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const logEvent = useCallback((message, extra) => {
    try {
      const body = JSON.stringify({
        ts: Date.now(),
        scope: 'AdminBillingPanel',
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
    const controller = new AbortController();

    const fetchBilling = async () => {
      try {
        const res = await fetch('/api/admin/billing', { signal: controller.signal }); // ✅ FAZA 8 WDROŻONA
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error((data && data.message) || `HTTP ${res.status}`);
        if (mounted) setCompanies(Array.isArray(data) ? data : []);
      } catch (err) {
        if (mounted) {
          toast.error(t('admin.billing.fetchError') || 'Nie udało się pobrać danych subskrypcyjnych');
          logEvent('billing_fetch_error', { message: err && err.message });
          setCompanies([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBilling();
    return () => {
      mounted = false;
      controller.abort(); // ✅ FAZA 13 WDROŻONA
    };
  }, [t, logEvent]);

  const rows = useMemo(() => companies || [], [companies]); // ✅ FAZA 13 WDROŻONA

  const exportCSV = () => {
    const header = ['Firma', 'Plan', 'Status'];
    const dataRows = rows.map((c) => [c.name || '', c.plan || '', c.status || '']);
    const csv = [header, ...dataRows]
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
    a.download = 'billing_companies.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  }; // ✅ FAZA 10 WDROŻONA (eksport CSV)

  return (
    <div
      className="p-6 space-y-6"
      style={{
        backgroundColor: theme?.surface || theme?.background || undefined,
        color: theme?.text || undefined,
      }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {t('admin.billing.title') || 'Panel Płatności i Subskrypcji'}
        </h1>
        <button
          type="button"
          onClick={exportCSV}
          className="px-3 py-1 rounded text-white"
          style={{ backgroundColor: theme?.primary || '#2563eb' }}
        >
          {t('common.exportCsv') || 'Eksport CSV'}
        </button>
      </div>

      {loading ? (
        <p aria-busy="true">{t('common.loading') || 'Ładowanie danych...'}</p>
      ) : (
        <div className="overflow-x-auto">
          <table
            className="w-full table-auto border-collapse text-sm"
            style={{ borderColor: theme?.primary || undefined }}
          >
            <thead>
              <tr className="text-left font-semibold" style={{ backgroundColor: theme?.surface || undefined }}>
                <th scope="col" className="p-2 border-b" style={{ borderColor: theme?.primary || undefined }}>
                  {t('admin.billing.company') || 'Firma'}
                </th>
                <th scope="col" className="p-2 border-b" style={{ borderColor: theme?.primary || undefined }}>
                  {t('admin.billing.plan') || 'Plan'}
                </th>
                <th scope="col" className="p-2 border-b" style={{ borderColor: theme?.primary || undefined }}>
                  {t('admin.billing.status') || 'Status'}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, idx) => (
                <tr key={c.id || c._id || idx} className="border-t" style={{ borderColor: theme?.primary || undefined }}>
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.plan}</td>
                  <td className="p-2">
                    <StripeStatusTag status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">{t('admin.billing.invoices') || 'Faktury'}</h2>
        <InvoiceList />
      </div>
    </div>
  );
}
