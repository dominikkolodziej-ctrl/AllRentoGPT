// Ścieżka: src/components/admin/FirmPositionTag.jsx
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1
import { ThemeContext } from '@/context/ThemeContext.jsx'; // ✅ FAZA 9

const FirmPositionTag = ({ position }) => {
  const { t } = useLiveText(); // ✅ FAZA 1
  const { theme } = useContext(ThemeContext); // ✅ FAZA 9

  const color =
    position === 'top'
      ? theme.bgSuccess || 'bg-green-200'
      : position === 'avg'
      ? theme.bgWarning || 'bg-yellow-200'
      : theme.bgError || 'bg-red-200';

  const label =
    position === 'top'
      ? t('benchmark.top') || 'Top 10%'
      : position === 'avg'
      ? t('benchmark.avg') || 'Średnia'
      : t('benchmark.belowAvg') || 'Poniżej średniej';

  return <span className={`px-2 py-1 rounded ${color}`}>{label}</span>;
};

FirmPositionTag.propTypes = {
  position: PropTypes.any,
};

export default FirmPositionTag;
