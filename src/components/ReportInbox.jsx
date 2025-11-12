import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';
import { getReports, resolveReport } from '@/api/moderationApi';

const ReportInbox = ({ onEvent, className = '' }) => {
  const { t } = useLiveText();
  const { theme } = useTheme();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [error, setError] = useState(null);
  const [undo, setUndo] = useState(null);
  const undoTimerRef = useRef(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReports();
      setReports(Array.isArray(data) ? data : []);
      onEvent?.('reports_loaded', { count: Array.isArray(data) ? data.length : 0 });
    } catch {
      setError(t('reports.loadError') || 'Nie udało się pobrać zgłoszeń.');
      toast.error(t('reports.loadError') || 'Nie udało się pobrać zgłoszeń.');
      onEvent?.('reports_load_error');
    } finally {
      setLoading(false);
    }
  }, [onEvent, t]);

  useEffect(() => {
    loadReports();
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, [loadReports]);

  const handleResolve = useCallback(
    async (id) => {
      if (!id || resolvingId) return;
      const item = reports.find((r) => (r?._id ?? r?.id) === id);
      if (!item) return;
      setResolvingId(id);

      setReports((prev) => prev.filter((r) => (r._id ?? r.id) !== id));
      setUndo({ item, id });
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => setUndo(null), 5000);

      try {
        await resolveReport(id);
        toast.success(t('reports.resolved') || 'Oznaczono jako rozwiązane');
        onEvent?.('report_resolved', { id });
      } catch {
        setReports((prev) => [item, ...prev]);
        setUndo(null);
        toast.error(t('reports.resolveError') || 'Nie udało się oznaczyć zgłoszenia.');
        onEvent?.('report_resolve_error', { id });
      } finally {
        setResolvingId(null);
      }
    },
    [reports, resolvingId, t, onEvent]
  );

  const handleUndo = useCallback(() => {
    if (!undo) return;
    setReports((prev) => [undo.item, ...prev]);
    setUndo(null);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    toast.success(t('undo') || 'Cofnięto');
    onEvent?.('report_resolve_undo_local', { id: undo.id });
  }, [undo, onEvent, t]);

  const containerCls = `space-y-4 ${className}`;
  const cardCls = `${theme?.card ?? 'border rounded p-3 bg-white'} flex justify-between items-start`;
  const btnResolveCls =
    theme?.successButton ?? 'ml-4 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700';
  const alertErrCls =
    theme?.alertError ?? 'bg-red-50 border border-red-200 text-red-800 p-3 rounded';
  const btnReloadCls =
    theme?.secondaryButton ?? 'px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300';

  return (
    <div className={containerCls}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('reports.inboxTitle') || 'Zgłoszenia do moderacji'}</h2>
        <button type="button" onClick={loadReports} className={btnReloadCls} disabled={loading}>
          {t('common.reload') || 'Odśwież'}
        </button>
      </div>

      {undo && (
        <div className="flex items-center gap-3 text-sm bg-gray-100 p-2 rounded">
          <span>{t('reports.undoBanner') || 'Zgłoszenie oznaczone jako rozwiązane.'}</span>
          <button type="button" onClick={handleUndo} className="underline">
            {t('undo') || 'Cofnij'}
          </button>
        </div>
      )}

      {error && <div className={alertErrCls}>{error}</div>}

      {loading && reports.length === 0 ? (
        <p className="text-gray-500">{t('common.loading') || 'Ładowanie...'}</p>
      ) : reports.length === 0 ? (
        <p className="text-gray-500">{t('reports.none') || 'Brak zgłoszeń.'}</p>
      ) : (
        <ul className="space-y-2" aria-label={t('reports.list') || 'Lista zgłoszeń'}>
          {reports.map((r) => {
            const id = r._id ?? r.id;
            return (
              <li key={id} className={cardCls}>
                <div>
                  <p className="font-semibold">{r.subject}</p>
                  <p className="text-sm text-gray-600">{r.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('reports.reportedBy') || 'Zgłoszone przez'}: {r.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleResolve(id)}
                  className={btnResolveCls}
                  disabled={resolvingId === id}
                  aria-disabled={resolvingId === id}
                >
                  {t('reports.markResolved') || 'Oznacz jako rozwiązane'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

ReportInbox.propTypes = {
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export default memo(ReportInbox);
