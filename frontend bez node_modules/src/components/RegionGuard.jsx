import React, { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';
import { getVoivodeshipByCoords } from '@/utils/geoUtils.js';

const RegionGuard = ({ lat, lng, branchVoivodeship, onValidChange, onEvent, className = '' }) => {
  const { t } = useLiveText();
  const { theme } = useTheme();
  const [status, setStatus] = useState('checking');
  const runIdRef = useRef(0);

  useEffect(() => {
    const hasInputs = typeof lat === 'number' && typeof lng === 'number' && !!branchVoivodeship;
    if (!hasInputs) {
      setStatus('checking');
      return;
    }
    const runId = ++runIdRef.current;
    const validate = async () => {
      try {
        const detectedVoivodeship = await getVoivodeshipByCoords(lat, lng);
        if (runId !== runIdRef.current) return;
        const isValid = detectedVoivodeship === branchVoivodeship;
        setStatus(isValid ? 'valid' : 'invalid');
        onValidChange?.(isValid);
        onEvent?.('region_guard_validated', {
          detected: detectedVoivodeship,
          expected: branchVoivodeship,
          valid: isValid,
        });
      } catch {
        if (runId !== runIdRef.current) return;
        setStatus('invalid');
        onValidChange?.(false);
        onEvent?.('region_guard_error');
      }
    };
    validate();
  }, [lat, lng, branchVoivodeship, onValidChange, onEvent]);

  if (status !== 'invalid') return null;

  return (
    <div
      className={`${theme?.alertError ?? 'text-sm text-red-600 mt-2'} ${className}`}
      role="alert"
      aria-live="polite"
    >
      {t('regionGuard.outOfRegion') ||
        `⚠ Lokalizacja tej oferty wykracza poza województwo oddziału firmy (${branchVoivodeship}). Ustaw nową lokalizację w granicach tego regionu.`}
    </div>
  );
};

RegionGuard.propTypes = {
  lat: PropTypes.number,
  lng: PropTypes.number,
  branchVoivodeship: PropTypes.string,
  onValidChange: PropTypes.func,
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export default memo(RegionGuard);
