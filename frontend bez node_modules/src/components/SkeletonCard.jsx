import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const SkeletonCard = ({
  className = '',
  showImage = true,
  showTitle = true,
  showLocation = true,
  showPrice = true,
}) => {
  const { t } = useLiveText();
  const { theme } = useTheme();

  const container =
    `${theme?.card ?? 'border rounded-xl p-4 bg-white shadow-md'} animate-pulse flex flex-col overflow-hidden ${className}`;
  const bg = theme?.skeleton ?? 'bg-gray-200';
  const bgAlt = theme?.skeletonAlt ?? 'bg-gray-300';

  return (
    <div
      className={container}
      role="status"
      aria-live="polite"
      aria-label={t('skeleton.loadingCard') || 'Ładowanie karty oferty'}
    >
      {showImage && <div className={`w-full h-48 ${bg} rounded-lg mb-4`} aria-hidden="true" />}
      {showTitle && <div className={`h-6 ${bgAlt} rounded w-4/5 mb-2 mx-auto`} aria-hidden="true" />}
      {showLocation && <div className={`h-4 ${bg} rounded w-2/3 mb-2 mx-auto`} aria-hidden="true" />}
      {showPrice && <div className={`h-5 ${bgAlt} rounded w-3/4 mx-auto`} aria-hidden="true" />}
      <span className="sr-only">{t('common.loading') || 'Ładowanie...'}</span>
    </div>
  );
};

SkeletonCard.propTypes = {
  className: PropTypes.string,
  showImage: PropTypes.bool,
  showTitle: PropTypes.bool,
  showLocation: PropTypes.bool,
  showPrice: PropTypes.bool,
};

export default memo(SkeletonCard);
