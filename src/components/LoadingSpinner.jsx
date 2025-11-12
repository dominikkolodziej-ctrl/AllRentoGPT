import React, { memo, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const LoadingSpinner = ({
  label,
  showLabel = true,
  size = 'md',
  fullScreen = true,
  className = '',
  delay = 0,
  onEvent,
}) => {
  const { t } = useLiveText();
  const theme = useTheme();
  const classes = theme?.classes ?? {};

  const [visible, setVisible] = useState(delay === 0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const id = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(id);
    }
  }, [delay]);

  useEffect(() => {
    try {
      const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)');
      if (mql) {
        const update = () => setReduced(!!mql.matches);
        update();
        mql.addEventListener?.('change', update);
        return () => mql.removeEventListener?.('change', update);
      }
    } catch { /* empty */ }
  }, []);

  useEffect(() => {
    if (visible) onEvent?.('spinner_shown');
    return () => onEvent?.('spinner_unmounted');
  }, [visible, onEvent]);

  const sizeClass = useMemo(() => {
    if (typeof size === 'number') return null;
    switch (size) {
      case 'sm':
        return 'h-5 w-5';
      case 'lg':
        return 'h-16 w-16';
      default:
        return 'h-10 w-10';
    }
  }, [size]);

  const spinnerStyle = typeof size === 'number' ? { height: size, width: size } : undefined;

  const containerClass =
    classes.spinnerContainer ??
    (fullScreen ? 'flex items-center justify-center h-screen' : 'flex items-center justify-center p-4');

  const spinnerBase = classes.spinner ?? 'rounded-full border-b-2 border-blue-600';
  const animateClass = reduced ? 'animate-none' : 'animate-spin';

  if (!visible) return null;

  return (
    <div className={`${containerClass} ${className}`} role="status" aria-live="polite" aria-busy="true">
      <div className={`${animateClass} ${spinnerBase} ${sizeClass ?? ''}`} style={spinnerStyle} />
      {showLabel && <span className="sr-only">{label ?? t('Ładowanie...')}</span>}
    </div>
  );
};

LoadingSpinner.propTypes = {
  label: PropTypes.string,
  showLabel: PropTypes.bool,
  size: PropTypes.oneOfType([PropTypes.oneOf(['sm', 'md', 'lg']), PropTypes.number]),
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
  delay: PropTypes.number,
  onEvent: PropTypes.func,
};

export default memo(LoadingSpinner);
