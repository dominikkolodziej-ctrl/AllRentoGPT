import PropTypes from 'prop-types';
import React from 'react';
import { useLiveTheme } from '@/hooks/useLiveTheme.js';

const LivePreviewRenderer = ({ children }) => {
  const { theme } = useLiveTheme();

  return (
    <div className={`theme-${theme}`}>
      {children}
    </div>
  );
};

LivePreviewRenderer.propTypes = {
  children: PropTypes.any,
};

export default LivePreviewRenderer;
