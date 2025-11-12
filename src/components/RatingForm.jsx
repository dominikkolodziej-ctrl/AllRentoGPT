import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const stars = [1, 2, 3, 4, 5];

const RatingForm = ({ onSubmit, onEvent, className = '' }) => {
  const { t } = useLiveText();
  const { theme } = useTheme();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [undoVisible, setUndoVisible] = useState(false);
  const prevRatingRef = useRef(0);
  const undoTimerRef = useRef(null);

  const containerCls = `${className} space-y-4`;
  const titleCls = theme?.heading2 ?? 'text-lg font-semibold';
  const starActive = theme?.starActive ?? 'text-yellow-400';
  const starInactive = theme?.starInactive ?? 'text-gray-300';
  const textareaCls =
    theme?.textarea ?? 'w-full border p-2 rounded';
  const btnPrimary =
    theme?.primaryButton ?? 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60';

  const labelTitle = useMemo(() => t('rating.title') || 'Twoja opinia', [t]);

  const setWithUndo = useCallback((value) => {
    prevRatingRef.current = rating;
    setRating(value);
    setUndoVisible(true);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setUndoVisible(false), 5000);
    onEvent?.('rating_changed', { value });
  }, [rating, onEvent]);

  const undoChange = useCallback(() => {
    const prev = prevRatingRef.current || 0;
    setRating(prev);
    setUndoVisible(false);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    onEvent?.('rating_undo', { value: prev });
  }, [onEvent]);

  const handleSubmit = useCallback(async () => {
    if (rating < 1) return;
    setSubmitting(true);
    try {
      await onSubmit?.({ rating, comment });
      onEvent?.('rating_submitted', { rating });
    } finally {
      setSubmitting(false);
    }
  }, [rating, comment, onSubmit, onEvent]);

  return (
    <div className={containerCls}>
      <h2 className={titleCls}>{labelTitle}</h2>

      <div
        className="flex gap-2"
        role="radiogroup"
        aria-label={t('rating.group') || 'Ocena w gwiazdkach'}
      >
        {stars.map((n) => {
          const active = rating >= n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${n}/5`}
              className={`text-2xl ${active ? starActive : starInactive}`}
              onClick={() => setWithUndo(n)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setWithUndo(n);
                }
              }}
            >
              ★
            </button>
          );
        })}
      </div>

      {undoVisible && (
        <div className="flex items-center gap-3">
          <span className="text-sm">{t('rating.changed') || 'Zmieniono ocenę.'}</span>
          <button type="button" onClick={undoChange} className="text-sm underline">
            {t('undo') || 'Cofnij'}
          </button>
        </div>
      )}

      <textarea
        className={textareaCls}
        placeholder={t('rating.commentPlaceholder') || 'Dodatkowe uwagi (opcjonalne)'}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        aria-label={t('rating.commentLabel') || 'Komentarz'}
      />

      <button
        type="button"
        className={btnPrimary}
        onClick={handleSubmit}
        disabled={submitting || rating < 1}
        aria-disabled={submitting || rating < 1}
      >
        {t('rating.submit') || 'Wyślij opinię'}
      </button>
    </div>
  );
};

RatingForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export { RatingForm };
export default memo(RatingForm);
