import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';

const mockReports = [
  { id: 1, content: 'Obraźliwy komentarz', reporter: 'jan@wp.pl' },
  { id: 2, content: 'Spam', reporter: 'ania@example.com' },
];

const ModerationPanel = ({
  initialReports = mockReports,
  onAction,
  onEvent,
  className = '',
}) => {
  const { theme } = useTheme();
  const { t } = useLiveText();

  const baseReports = useMemo(
    () => initialReports.map((r) => ({ ...r, status: r.status ?? 'open' })),
    [initialReports]
  );
  const [reports, setReports] = useState(baseReports);
  const [undo, setUndo] = useState(null);
  const undoTimerRef = useRef(null);

  useEffect(() => {
    setReports(baseReports);
  }, [baseReports]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const containerCls = clsx('p-6', theme?.background, theme?.text, className);
  const itemCls = (extra) =>
    clsx('p-3 border', theme?.border ?? 'border-gray-200', theme?.radius ?? 'rounded', extra);
  const btnPrimary = clsx(
    'px-2 py-1',
    theme?.primary ?? 'bg-blue-600 text-white hover:bg-blue-700',
    theme?.radius ?? 'rounded'
  );
  const btnSecondary = clsx(
    'px-2 py-1',
    theme?.secondary ?? 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    theme?.radius ?? 'rounded'
  );

  const scheduleUndo = useCallback((payload) => {
    setUndo(payload);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setUndo(null), 5000);
  }, []);

  const markFalse = useCallback(
    (id) => {
      setReports((prev) => {
        const before = prev.find((r) => r.id === id);
        const next = prev.map((r) => (r.id === id ? { ...r, status: 'false' } : r));
        scheduleUndo({ id, prevStatus: before?.status ?? 'open' });
        return next;
      });
      onAction?.('mark_false', { id });
      onEvent?.('moderation_mark_false', { id });
    },
    [onAction, onEvent, scheduleUndo]
  );

  const hideContent = useCallback(
    (id) => {
      setReports((prev) => {
        const before = prev.find((r) => r.id === id);
        const next = prev.map((r) => (r.id === id ? { ...r, status: 'hidden' } : r));
        scheduleUndo({ id, prevStatus: before?.status ?? 'open' });
        return next;
      });
      onAction?.('hide_content', { id });
      onEvent?.('moderation_hide', { id });
    },
    [onAction, onEvent, scheduleUndo]
  );

  const undoLast = useCallback(() => {
    if (!undo) return;
    setReports((prev) => prev.map((r) => (r.id === undo.id ? { ...r, status: undo.prevStatus } : r)));
    onEvent?.('moderation_undo', { id: undo.id, prevStatus: undo.prevStatus });
    setUndo(null);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }, [undo, onEvent]);

  return (
    <div className={containerCls}>
      <h2 className="text-lg font-semibold mb-4">{t('Zgłoszenia użytkowników')}</h2>

      {undo && (
        <div className={clsx('mb-3 flex items-center gap-2', theme?.infoBg ?? 'bg-gray-100', 'p-2 rounded')}>
          <span className="text-sm">{t('Zastosowano akcję moderacji.')}</span>
          <button type="button" onClick={undoLast} className={btnSecondary} aria-label={t('Cofnij')}>
            {t('Cofnij')}
          </button>
        </div>
      )}

      <ul className="space-y-2">
        {reports.map((r) => (
          <li key={r.id} className={itemCls()}>
            <p>
              <strong>{t('Zgłoszenie')}:</strong> {r.content}
            </p>
            <p>
              <strong>{t('Zgłaszający')}:</strong> {r.reporter}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => markFalse(r.id)}
                className={btnPrimary}
                aria-label={t('Oznacz jako fałszywe')}
                disabled={r.status === 'false'}
              >
                {t('Oznacz jako fałszywe')}
              </button>
              <button
                type="button"
                onClick={() => hideContent(r.id)}
                className={btnSecondary}
                aria-label={t('Ukryj treść')}
                disabled={r.status === 'hidden'}
              >
                {t('Ukryj treść')}
              </button>
              <span className="ml-auto text-xs text-gray-500">
                {r.status === 'false' ? t('Fałszywe zgłoszenie') : r.status === 'hidden' ? t('Ukryto treść') : null}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

ModerationPanel.propTypes = {
  initialReports: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      content: PropTypes.string.isRequired,
      reporter: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['open', 'false', 'hidden']),
    })
  ),
  onAction: PropTypes.func,
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export default ModerationPanel;
