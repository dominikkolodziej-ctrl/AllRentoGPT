import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const EquipmentReturnPanel = ({
  reservation,
  onConfirmReturn,
  onUndo,
  onEvent,
  t = (s) => s,
  className = '',
  requireNote = false,
}) => {
  const [conditionNote, setConditionNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [undoAvailable, setUndoAvailable] = useState(false);
  const undoTimerRef = useRef(null);

  const canSubmit =
    Boolean(reservation?._id) && (!requireNote || conditionNote.trim().length > 0);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onConfirmReturn?.({ reservationId: reservation._id, conditionNote });
    onEvent?.('equipment_return_confirmed', {
      reservationId: reservation._id,
      noteLength: conditionNote.trim().length,
    });
    setConfirmed(true);
    setUndoAvailable(true);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setUndoAvailable(false), 5000);
  };

  const handleUndo = () => {
    setConfirmed(false);
    setUndoAvailable(false);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    onUndo?.({ reservationId: reservation?._id });
    onEvent?.('equipment_return_undone', { reservationId: reservation?._id });
  };

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  if (confirmed) {
    return (
      <div className="p-4 bg-green-100 text-green-700 rounded space-y-3">
        <div>{t('Zwrot sprzętu został zarejestrowany.')}</div>
        {undoAvailable && (
          <button
            type="button"
            onClick={handleUndo}
            className="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
          >
            {t('Cofnij')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-lg font-semibold">{t('Zwrot sprzętu')}</h2>
      <p className="text-sm text-gray-600">
        {t('Zweryfikuj stan zwróconego sprzętu i zatwierdź odbiór.')}
      </p>
      <textarea
        value={conditionNote}
        onChange={(e) => setConditionNote(e.target.value)}
        placeholder={t('Opis stanu technicznego po zwrocie')}
        className="w-full border p-2 rounded"
        rows={4}
        aria-label={t('Opis stanu technicznego po zwrocie')}
      />
      <button
        type="button"
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={!canSubmit}
      >
        {t('Potwierdź zwrot')}
      </button>
    </div>
  );
};

EquipmentReturnPanel.propTypes = {
  reservation: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  onConfirmReturn: PropTypes.func.isRequired,
  onUndo: PropTypes.func,
  onEvent: PropTypes.func,
  t: PropTypes.func,
  className: PropTypes.string,
  requireNote: PropTypes.bool,
};

export { EquipmentReturnPanel };
export default EquipmentReturnPanel;
