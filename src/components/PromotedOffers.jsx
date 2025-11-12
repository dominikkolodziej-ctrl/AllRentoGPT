import React, { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import demoOffers from '@/data/demoOffers.js';
import OfferCard from '@/components/OfferCard.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const PromotedOffers = ({ max = 12, onEvent, className = '' }) => {
  const [promoted, setPromoted] = useState([]);
  const { t } = useLiveText();
  const { theme } = useTheme();

  useEffect(() => {
    const filtered = demoOffers.filter((offer) => offer?.promoted === true);
    const arr = [...filtered];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const selected = arr.slice(0, max);
    setPromoted(selected);
    onEvent?.('promoted_offers_loaded', { count: selected.length });
  }, [max, onEvent]);

  const gridClass =
    theme?.offersGrid ??
    'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';

  return (
    <div
      className={`${gridClass} ${className}`}
      role="list"
      aria-label={t('offers.promoted') || 'Promowane oferty'}
    >
      {promoted.length > 0 ? (
        promoted.map((offer) => (
          <OfferCard key={offer.id ?? offer._id} offer={offer} />
        ))
      ) : (
        <p className="text-gray-500 col-span-full">
          {t('offers.nonePromoted') || 'Brak promowanych ofert.'}
        </p>
      )}
    </div>
  );
};

PromotedOffers.propTypes = {
  max: PropTypes.number,
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export default memo(PromotedOffers);
