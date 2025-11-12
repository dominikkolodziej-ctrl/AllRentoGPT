import { useMemo } from 'react';
import { useTheme as useCtx } from '@/context/ThemeContext.jsx';

export const useTheme = () => {
  const ctx = useCtx(); // ✅ FAZA 12 WDROŻONA
  const setTheme = ctx && ctx.setTheme ? ctx.setTheme : undefined;
  const raw = (ctx && ctx.theme) || {};

  const text = raw.text;
  const background = raw.background;
  const primary = raw.primary;

  const style = useMemo(
    () => ({
      color: text || '#111',
      backgroundColor: background || '#fff',
      borderColor: primary || '#0ea5e9',
    }),
    [text, background, primary]
  );

  const button = useMemo(
    () => ({
      backgroundColor: primary || '#0ea5e9',
      color: '#fff',
      borderRadius: '8px',
      padding: '0.5rem 1rem',
    }),
    [primary]
  );

  return { theme: raw, setTheme, style, button };
};
