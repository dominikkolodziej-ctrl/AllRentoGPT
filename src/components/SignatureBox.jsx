import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

// src/components/SignatureBox.jsx
const SignatureBox = ({ onSigned, width = 400, height = 150, className = '' }) => {
  const { t } = useLiveText();
  const { theme } = useTheme();

  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const hasInkRef = useRef(false);
  const [signed, setSigned] = useState(false);
  const [canConfirm, setCanConfirm] = useState(false);

  // HiDPI crisp lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';
  }, [width, height]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
    return { x, y };
  };

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawingRef.current = true;
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    hasInkRef.current = true;
    setCanConfirm(true);
  }, []);

  const stopDrawing = useCallback(() => {
    drawingRef.current = false;
  }, []);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasInkRef.current = false;
    setCanConfirm(false);
    setSigned(false);
  }, []);

  const handleConfirm = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasInkRef.current) return;
    const dataUrl = canvas.toDataURL('image/png');
    setSigned(true);
    onSigned?.(dataUrl);
  }, [onSigned]);

  const labelTitle = t('signature.title') || 'Podpisz dokument';
  const labelClear = t('signature.clear') || 'Wyczyść';
  const labelConfirm = t('signature.confirm') || 'Zatwierdź podpis';
  const labelSaved = t('signature.saved') || '✅ Podpis został zapisany.';

  const btnClearCls = theme?.secondaryButton ?? 'px-4 py-2 bg-gray-300 rounded hover:bg-gray-400';
  const btnPrimaryCls =
    theme?.primaryButton ?? 'px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60';

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className={theme?.heading2 ?? 'text-lg font-semibold'}>{labelTitle}</h2>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border w-full rounded touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
        aria-label={t('signature.canvas') || 'Pole podpisu'}
      />

      <div className="flex gap-3">
        <button type="button" onClick={handleClear} className={btnClearCls}>
          {labelClear}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className={btnPrimaryCls}
          disabled={!canConfirm}
          aria-disabled={!canConfirm}
        >
          {labelConfirm}
        </button>
      </div>

      {signed && <p className="text-green-600 text-sm">{labelSaved}</p>}
    </div>
  );
};

SignatureBox.propTypes = {
  onSigned: PropTypes.func.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  className: PropTypes.string,
};

export { SignatureBox };
export default memo(SignatureBox);
