// src/components/HelpCenterSection.jsx
import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const HelpCenterSection = ({ onEvent, className = '' }) => {
  const { t } = useLiveText();
  const theme = useTheme();
  const classes = theme?.classes ?? {};
  const btnPrimary =
    classes.buttonPrimary ??
    'inline-block bg-blue-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-blue-700 transition';
  const heading = classes.heading2 ?? 'text-lg font-semibold mb-2';
  const paragraph = classes.paragraph ?? 'text-sm text-gray-600 mb-3';

  const handleClick = useCallback(() => {
    onEvent?.('helpcenter_open', { source: 'HelpCenterSection' });
  }, [onEvent]);

  return (
    <section className={`text-center mt-12 ${className}`}>
      <h2 className={heading}>{t('Potrzebujesz pomocy?')}</h2>
      <p className={paragraph}>{t('Sprawdź nasze Centrum Pomocy lub skontaktuj się z nami')}</p>
      <a
        href="/help"
        onClick={handleClick}
        className={btnPrimary}
        aria-label={t('Przejdź do Centrum Pomocy')}
      >
        {t('Przejdź do Centrum Pomocy')}
      </a>
    </section>
  );
};

HelpCenterSection.propTypes = {
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export default memo(HelpCenterSection);
