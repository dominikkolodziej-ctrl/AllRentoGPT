import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1 – tłumaczenia
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 9 – motywy

// Ścieżka: src/components/Offers/MapRadiusModal.jsx
const MapRadiusModal = ({ onApply }) => {
  const [radius, setRadius] = useState(10);
  const t = useLiveText; // ✅ FAZA 1 – tłumaczenia
  const { theme } = useTheme(); // ✅ FAZA 9 – motywy

  const handleApply = () => {
    onApply(radius);
  };

  return (
    <div className={`p-4 ${theme?.panelBg || 'bg-white'} ${theme?.textPrimary || ''}`}>
      <label htmlFor="radius-input" className="block mb-2">
        {t('map.radius.label') || 'Promień (km):'}
      </label>
      <input
        id="radius-input"
        type="number"
        value={radius}
        onChange={(e) => setRadius(Number(e.target.value))}
        className={`border p-2 w-full ${theme?.border || 'border-gray-300'}`}
      />
      <button
        onClick={handleApply}
        className={`mt-4 ${theme?.buttonPrimaryBg || 'bg-blue-500'} ${theme?.buttonPrimaryText || 'text-white'} px-4 py-2 rounded`}
      >
        {t('common.apply') || 'Zastosuj'}
      </button>
    </div>
  );
};

MapRadiusModal.propTypes = {
  onApply: PropTypes.func.isRequired
};

export default MapRadiusModal;
