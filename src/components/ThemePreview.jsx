import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

function hexToRgb(hex) {
  const h = String(hex || '').trim();
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h)) return null;
  const full = h.length === 4 ? `#${[1, 2, 3].map((i) => h[i] + h[i]).join('')}` : h;
  const n = parseInt(full.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function luminance({ r, g, b }) {
  const f = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrastRatio(a, b) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  if (!A || !B) return null;
  const L1 = luminance(A);
  const L2 = luminance(B);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

const ThemePreview = ({ theme, className = '', onEvent }) => {
  const { t } = useLiveText();
  const { theme: ds } = useTheme();

  const ratio = useMemo(
    () => contrastRatio(theme?.text, theme?.background),
    [theme?.text, theme?.background]
  );
  const ratioText = ratio ? `${ratio.toFixed(2)}:1` : '—';
  const ratioBad = ratio !== null && ratio < 4.5;

  const containerCls = `${ds?.card ?? 'rounded shadow p-4 mt-6'} ${className}`;
  const btnCls =
    ds?.primaryButton ?? 'px-4 py-2 rounded';
  const badgeCls =
    ds?.badge ?? 'ml-4 px-2 py-1 rounded text-white';

  return (
    <div
      className={containerCls}
      style={{
        backgroundColor: theme.background,
        color: theme.text,
        border: `2px solid ${theme.primary}`,
      }}
      role="region"
      aria-label={t('theme.preview.region') || 'Podgląd motywu'}
    >
      <h3 className="text-lg font-bold mb-2">{t('theme.preview.title') || 'Podgląd motywu'}</h3>
      <p className="mb-4">
        {t('theme.preview.description') || 'To przykładowa karta z podglądem Twojego motywu kolorystycznego.'}
      </p>

      <div className="flex items-center">
        <button
          type="button"
          style={{ backgroundColor: theme.primary, color: '#fff' }}
          className={btnCls}
          onClick={() => onEvent?.('theme_preview_primary_clicked')}
          aria-label={t('theme.preview.primaryButton') || 'Przycisk główny'}
        >
          {t('theme.preview.primaryButton') || 'Przycisk główny'}
        </button>
        <span
          className={badgeCls}
          style={{ backgroundColor: theme.secondary, color: '#fff' }}
          aria-label={t('theme.preview.secondaryBadge') || 'Sekundarny'}
        >
          {t('theme.preview.secondaryBadge') || 'Sekundarny'}
        </span>
      </div>

      <div className="mt-3 text-xs">
        {(t('theme.contrast') || 'Kontrast tekst/tło')}: <strong>{ratioText}</strong>{' '}
        {ratioBad && (
          <span className="text-red-600" aria-live="polite">
            {t('theme.contrastWarn') || '(mniej niż 4.5:1)'}
          </span>
        )}
      </div>
    </div>
  );
};

ThemePreview.propTypes = {
  theme: PropTypes.shape({
    background: PropTypes.string,
    text: PropTypes.string,
    primary: PropTypes.string,
    secondary: PropTypes.string,
  }).isRequired,
  className: PropTypes.string,
  onEvent: PropTypes.func,
};

export default memo(ThemePreview);
