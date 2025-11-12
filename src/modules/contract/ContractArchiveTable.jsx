import React, { useEffect, useMemo, useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext.jsx';
import { getContractsByCompany } from '@/api/contractApi';
import { useLiveText } from '@/context/LiveTextContext.jsx';
import { useTheme } from '@/context/ThemeContext.jsx';

export default function ContractArchiveTable() {
  const { user } = useContext(AuthContext);
  const { t } = useLiveText();
  const { theme } = useTheme(); // ✅ FAZA 12 WDROŻONA
  const [contracts, setContracts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user?.company?._id) return;
      setLoading(true);
      try {
        const list = await getContractsByCompany(user.company._id);
        if (mounted && Array.isArray(list)) setContracts(list);
      } catch {
        if (mounted) setContracts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  const filtered = useMemo(
    () => (filter === 'all' ? contracts : contracts.filter((c) => c.status === filter)),
    [contracts, filter]
  );

  const statusLabel = (s) => {
    if (s === 'pending') return t('contracts.status.pending') || 'Oczekująca';
    if (s === 'signed') return t('contracts.status.signed') || 'Podpisana';
    if (s === 'rejected') return t('contracts.status.rejected') || 'Odrzucona';
    return s || '-';
  };

  const downloadPdf = async (url, filename = 'contract.pdf') => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch {
      /* ignore */
    }
  };

  const exportCSV = () => {
    const rows = [
      [
        t('contracts.table.offer') || 'Oferta',
        t('contracts.table.client') || 'Klient',
        t('contracts.table.status') || 'Status',
        t('contracts.table.createdAt') || 'Data utworzenia',
      ],
      ...filtered.map((c) => [
        c.offer?.title || '',
        c.client?.name || '',
        statusLabel(c.status),
        c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
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
    a.download = 'contracts.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto" style={{ color: theme?.text || undefined }}>
      <h2 className="text-2xl font-bold mb-4">{t('contracts.archiveTitle') || 'Archiwum umów'}</h2>

      <div className="flex items-center gap-3 mb-4">
        {['all', 'pending', 'signed', 'rejected'].map((s) => {
          const selected = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              aria-pressed={selected}
              className="px-3 py-1 rounded"
              style={{
                backgroundColor: selected
                  ? theme?.primary || undefined
                  : theme?.surface || theme?.background || undefined,
                color: selected ? '#fff' : theme?.text || undefined,
                border: selected ? undefined : `1px solid ${theme?.primary || '#e5e7eb'}`,
              }}
            >
              {s === 'all' ? (t('contracts.filter.all') || 'Wszystkie') : statusLabel(s)}
            </button>
          );
        })}
        <button
          onClick={exportCSV}
          className="ml-auto px-3 py-1 rounded"
          style={{
            backgroundColor: theme?.primary || undefined,
            color: '#fff',
          }}
        >
          {t('contracts.actions.exportCsv') || 'Eksport CSV'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border" style={{ borderColor: theme?.primary || undefined }}>
          <thead>
            <tr className="text-left" style={{ backgroundColor: theme?.surface || theme?.background || undefined }}>
              <th className="p-2 border" style={{ borderColor: theme?.primary || undefined }}>
                {t('contracts.table.offer') || 'Oferta'}
              </th>
              <th className="p-2 border" style={{ borderColor: theme?.primary || undefined }}>
                {t('contracts.table.client') || 'Klient'}
              </th>
              <th className="p-2 border" style={{ borderColor: theme?.primary || undefined }}>
                {t('contracts.table.status') || 'Status'}
              </th>
              <th className="p-2 border" style={{ borderColor: theme?.primary || undefined }}>
                {t('contracts.table.createdAt') || 'Data utworzenia'}
              </th>
              <th className="p-2 border" style={{ borderColor: theme?.primary || undefined }}>
                {t('contracts.table.actions') || 'Akcje'}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c._id} className="border-t" style={{ borderColor: theme?.primary || undefined }}>
                <td className="p-2 border" style={{ borderColor: theme?.primary || undefined }}>
                  {c.offer?.title}
                </td>
                <td className="p-2 border" style={{ borderColor: theme?.primary || undefined }}>
                  {c.client?.name}
                </td>
                <td className="p-2 border" style={{ borderColor: theme?.primary || undefined }}>
                  {statusLabel(c.status)}
                </td>
                <td className="p-2 border" style={{ borderColor: theme?.primary || undefined }}>
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}
                </td>
                <td className="p-2 border" style={{ borderColor: theme?.primary || undefined }}>
                  <div className="flex gap-3">
                    <a
                      href={c.pdfUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: theme?.primary || undefined }}
                    >
                      {t('contracts.actions.preview') || 'Podgląd'}
                    </a>
                    {c.pdfUrl ? (
                      <button
                        type="button"
                        onClick={() =>
                          downloadPdf(c.pdfUrl, `${c.offer?.title || 'contract'}.pdf`)
                        }
                        className="underline"
                        style={{ color: theme?.primary || undefined }}
                      >
                        {t('contracts.actions.downloadPdf') || 'Pobierz PDF'}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !filtered.length && (
          <p className="text-gray-500 p-4">{t('contracts.empty') || 'Brak wyników.'}</p>
        )}
        {loading && <p className="text-gray-500 p-4">{t('common.loading') || 'Ładowanie...'}</p>}
      </div>
    </div>
  );
}
