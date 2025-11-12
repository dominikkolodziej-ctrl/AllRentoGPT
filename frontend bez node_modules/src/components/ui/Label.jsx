import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { ThemeContext } from '@/context/ThemeContext.jsx';
import { LiveTextContext } from '@/context/LiveTextContext.jsx';

/**
 * Label — komponent opisowy (np. dla inputów), zgodny z systemem Allrento.
 * Wspiera motywy (ThemeContext) oraz tłumaczenia (LiveTextContext).
 */
export const Label = ({ htmlFor, children, className = '' }) => {
  const { theme } = useContext(ThemeContext) || {};
  const { translate } = useContext(LiveTextContext) || {};

  const content =
    typeof children === 'string'
      ? (translate?.(children) ?? children)
      : children;

  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium mb-1 ${theme?.labelColor || 'text-gray-700'} ${className}`}
    >
      {content}
    </label>
  );
};

Label.propTypes = {
  htmlFor: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Label;
