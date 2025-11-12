import PropTypes from 'prop-types';
import React from 'react';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1 – tłumaczenia
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 9 – motywy

// Ścieżka: src/components/Offers/ShowOnMapButton.jsx
const ShowOnMapButton = ({ location }) => {
  const t = useLiveText; // ✅ FAZA 1 – tłumaczenia
  const { theme } = useTheme(); // ✅ FAZA 9 – motywy

  const handleClick = () => {
    if (location) {
      window.open(`https://www.google.com/maps?q=${encodeURIComponent(location)}`, "_blank");
    }
  };

  if (!location) {
    return (
      <span className={`${theme?.textSecondary || 'text-gray-500'} italic`}>
        {t('offers.map.noLocation') || 'Brak lokalizacji'}
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`${theme?.linkText || 'text-blue-600'} underline hover:opacity-80`}
    >
      {t('offers.map.show') || 'Pokaż na mapie'}
    </button>
  );
};

ShowOnMapButton.propTypes = {
  location: PropTypes.string
};

export default ShowOnMapButton;
