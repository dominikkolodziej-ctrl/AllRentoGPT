import React, { memo, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const OfferPinCard = ({ offer, index, onEvent, className = '' }) => {
  const { t } = useLiveText();
  const { theme } = useTheme();

  const id = offer?.id ?? offer?._id ?? index;
  const title = offer?.title || t('offer.noTitle') || 'Brak tytułu';
  const category = offer?.category || t('offer.noCategory') || 'Brak kategorii';
  const address = offer?.location?.address || t('offer.noLocation') || 'Brak lokalizacji';
  const year = offer?.year;

  const priceText = useMemo(() => {
    if (offer?.price == null || offer?.price === '') return null;
    const value = Number(offer.price);
    const formatted =
      Number.isFinite(value)
        ? new Intl.NumberFormat('pl-PL').format(value)
        : String(offer.price);
    return `${formatted} zł${offer?.unit ? ` / ${offer.unit}` : ''}`;
  }, [offer?.price, offer?.unit]);

  const handleClick = useCallback(() => {
    onEvent?.('offer_pin_open', { id });
  }, [onEvent, id]);

  const container =
    theme?.card ?? 'border rounded-lg p-4 shadow bg-white';
  const titleCls =
    theme?.cardTitle ?? 'font-semibold text-blue-700 mb-1';
  const metaCls = theme?.mutedText ?? 'text-sm text-gray-600 mb-1';
  const priceCls =
    theme?.priceText ?? 'text-blue-700 font-bold text-base';

  return (
    <div className={`${container} ${className}`} role="article">
      <Link
        to={`/offer/${id}`}
        onClick={handleClick}
        aria-label={t('offer.openDetails') || 'Otwórz szczegóły oferty'}
      >
        <h3 className={titleCls}>{title}</h3>
        <p className={metaCls}>
          {category} • {address}
        </p>
        {year && (
          <p className="text-sm text-gray-700 mb-1">
            {t('offer.year') || 'Rok produkcji'}: {year}
          </p>
        )}
        {priceText && <p className={priceCls}>{priceText}</p>}
      </Link>
    </div>
  );
};

OfferPinCard.propTypes = {
  offer: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    category: PropTypes.string,
    location: PropTypes.shape({
      address: PropTypes.string,
    }),
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    unit: PropTypes.string,
  }).isRequired,
  index: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export default memo(OfferPinCard);
