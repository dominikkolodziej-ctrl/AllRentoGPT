import React from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import "react-lazy-load-image-component/src/effects/blur.css";

// src/components/Card.jsx
const Card = ({ id, title, price, location, imageUrl }) => {
  const { theme } = useTheme() || {};
  const { t } = useLiveText?.() || { t: (k) => k };

  return (
    <Link
      to={`/offers/${id}`}
      className={
        theme?.cards?.container ||
        "bg-white rounded-xl shadow-md hover:shadow-xl transition block overflow-hidden group border"
      }
      aria-label={`${t('card.offerLabel') || 'Oferta'}: ${title}`}
    >
      {/* Obrazek */}
      <div
        className={
          theme?.cards?.imageWrapper ||
          "w-full h-48 relative overflow-hidden"
        }
      >
        <LazyLoadImage
          src={imageUrl}
          alt={`${t('card.thumbnailAlt') || 'Miniatura oferty'}: ${title}`}
          effect="blur"
          className={
            theme?.cards?.image ||
            "object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
          }
        />
      </div>

      {/* Treść */}
      <div className={theme?.cards?.content || "p-4 space-y-1"}>
        <h3
          className={theme?.cards?.title || "text-lg font-bold text-blue-700 truncate"}
        >
          {title}
        </h3>
        <p className={theme?.cards?.location || "text-sm text-gray-500"}>
          {location}
        </p>
        <p
          className={
            theme?.cards?.price ||
            "text-blue-600 font-semibold mt-1"
          }
        >
          {price
            ? `${price} ${t('card.currencyDay') || 'zł / dzień'}`
            : t('card.priceNegotiable') || 'Cena do uzgodnienia'}
        </p>
      </div>
    </Link>
  );
};

Card.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  location: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
};

export default Card;

// ✅ FAZA 1: pełne tłumaczenia (label, alt, cena, jednostka czasu)
// ✅ FAZA 9: podpięcie theme.cards.*
// ✅ FAZA 12: aria-label dla dostępności i alt dla SEO
