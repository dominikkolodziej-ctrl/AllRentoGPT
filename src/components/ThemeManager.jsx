import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import ThemePreview from '@/components/ThemePreview.jsx';

const defaultTheme = {
  primary: '#2563eb',
  secondary: '#64748b',
  background: '#f9fafb',
  text: '#111827',
};

function hexToRgb(hex) {
  let h = String(hex || '').trim();
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h)) return null;
  if (h.length === 4) h = `#${[1, 2, 3].map((i) => h[i] + h[i]).join('')}`;
  const n = parseInt(h.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function luminance({ r, g, b }) {
  const f = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const R = f(r);
  const G = f(g);
  const B = f(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function contrastRatio(hexA, hexB) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  if (!a || !b) return null;
  const L1 = luminance(a);
  const L2 = luminance(b);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}
function isValidHex(x) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(x || '').trim());
}

const ThemeManager = ({ onSave, initialTheme = defaultTheme, className = '', onEvent }) => {
  const { theme: ds, setTheme } = useTheme() || {};
  const { t } = useLiveText();

  const [theme, setThemeState] = useState({ ...defaultTheme, ...initialTheme });
  const [saved, setSaved] = useState(false);
  const prevThemeRef = useRef(theme);
  const undoTimerRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [errors, setErrors] = useState({});
  const [ratio, setRatio] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('theme.current');
      if (raw) {
        const parsed = JSON.parse(raw);
        setThemeState((p) => ({ ...p, ...parsed }));
      }
    } catch (err) {
      console.warn('ThemeManager: read theme.current failed', err);
    }
  }, []);

  useEffect(() => {
    const e = {};
    Object.entries(theme).forEach(([k, v]) => {
      if (!isValidHex(v)) e[k] = 'invalid';
    });
    setErrors(e);
    const cr = contrastRatio(theme.text, theme.background);
    setRatio(cr);
  }, [theme]);

  const handleChange = useCallback((key, value) => {
    setThemeState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(() => {
    if (Object.keys(errors).length > 0) return;
    prevThemeRef.current = theme;
    try {
      localStorage.setItem('theme.current', JSON.stringify(theme));
    } catch (err) {
      console.warn('ThemeManager: persist theme.current failed', err);
    }
    setTheme?.(theme);
    onSave?.(theme);
    onEvent?.('theme_saved', { keys: Object.keys(theme) });
    setSaved(true);
    setCanUndo(true);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setCanUndo(false), 5000);
    setTimeout(() => setSaved(false), 1000);
  }, [errors, theme, setTheme, onSave, onEvent]);

  const handleReset = useCallback(() => {
    setThemeState(defaultTheme);
    onEvent?.('theme_reset');
  }, [onEvent]);

  const handleUndo = useCallback(() => {
    setThemeState(prevThemeRef.current);
    setCanUndo(false);
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    onEvent?.('theme_undo');
  }, [onEvent]);

  const entries = useMemo(() => Object.entries(theme), [theme]);

  const container = `space-y-6 ${className}`;
  const gridCls = 'grid grid-cols-2 gap-4';
  const inputCls = ds?.colorInput ?? 'w-full h-10 rounded';
  const btnPrimary =
    ds?.primaryButton ?? 'px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60';
  const btnSecondary = ds?.secondaryButton ?? 'px-4 py-2 bg-gray-200 rounded hover:bg-gray-300';
  const badgeCls = saved ? 'text-green-700' : 'text-transparent';
  const invalidText = ds?.errorText ?? 'text-red-600 text-xs mt-1';
  const infoText = ds?.mutedText ?? 'text-xs text-gray-600';

  const invalid = Object.keys(errors).length > 0;
  const ratioLabel = ratio ? `${ratio.toFixed(2)}:1` : '—';
  const ratioBad = ratio !== null && ratio < 4.5;

  return (
    <div className={container} role="region" aria-label={t('theme.title') || 'Projektant motywu dashboardu'}>
      <h2 className="text-xl font-bold">
        {t('theme.title') || '🎨 Projektant motywu dashboardu'} <span className={`text-sm ml-2 ${badgeCls}`}>✔</span>
      </h2>

      <div className={gridCls}>
        {entries.map(([key, val]) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1 capitalize">{key}</label>
            <input
              type="color"
              value={val}
              onChange={(e) => handleChange(key, e.target.value)}
              className={inputCls}
              aria-label={key}
            />
            {!isValidHex(val) && <div className={invalidText}>{t('theme.invalidHex') || 'Niepoprawny kolor.'}</div>}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className={infoText}>
          {t('theme.contrast') || 'Kontrast tekst/tło'}: <strong>{ratioLabel}</strong>{' '}
          {ratioBad && <span className={invalidText}>{t('theme.contrastWarn') || '(mniej niż 4.5:1)'}</span>}
        </div>
      </div>

      <ThemePreview theme={theme} />

      <div className="flex items-center gap-3">
        <button type="button" className={btnPrimary} onClick={handleSave} disabled={invalid} aria-disabled={invalid}>
          {t('theme.save') || 'Zapisz motyw'}
        </button>
        <button type="button" className={btnSecondary} onClick={handleReset}>
          {t('theme.reset') || 'Resetuj'}
        </button>
        {canUndo && (
          <button type="button" className="underline text-sm" onClick={handleUndo}>
            {t('undo') || 'Cofnij'}
          </button>
        )}
      </div>
    </div>
  );
};

ThemeManager.propTypes = {
  onSave: PropTypes.func.isRequired,
  initialTheme: PropTypes.shape({
    primary: PropTypes.string,
    secondary: PropTypes.string,
    background: PropTypes.string,
    text: PropTypes.string,
  }),
  className: PropTypes.string,
  onEvent: PropTypes.func,
};

export { ThemeManager };
export default memo(ThemeManager);
