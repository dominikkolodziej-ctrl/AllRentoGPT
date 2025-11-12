// src/components/Offers/OffersGrid.jsx
import PropTypes from 'prop-types';
import React from 'react';
import AIInspectorPanel from "@/components/common/AIInspectorPanel.jsx";
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

// Ścieżka: src/components/Offers/OffersGrid.jsx
const OffersGrid = ({ offers }) => {
  const { t } = useLiveText(); // poprawne wywołanie hooka
  const { theme } = useTheme();

  if (!offers || offers.length === 0) {
    return (
      <p className={`${theme?.textSecondary || 'text-gray-500'} italic`}>
        {t('offers.grid.empty', 'Brak ofert do wyświetlenia.')}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {offers.map((offer) => (
        <div
          key={offer._id || offer.id}
          className={`${theme?.cardBg || 'bg-white'} ${theme?.border || 'border'} rounded-lg p-4 shadow`}
        >
          <h3 className={`text-xl font-semibold ${theme?.textPrimary || ''}`}>
            {offer.title}
          </h3>
          {offer.description && (
            <p className={theme?.textSecondary || ''}>{offer.description}</p>
          )}
          <p className="text-sm text-gray-600">
            {typeof offer.price !== 'undefined' && offer.price !== null
              ? `${offer.price} ${offer.currency || 'PLN'}`
              : t('offers.grid.noPrice', 'Cena na zapytanie')}
          </p>

          <AIInspectorPanel
            result={{
              qualityScore: 78,
              tier: 'B',
              flags: ['demo'],
            }}
          />
        </div>
      ))}
    </div>
  );
};

OffersGrid.propTypes = {
  offers: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      currency: PropTypes.string,
    })
  ),
};

export default OffersGrid;
