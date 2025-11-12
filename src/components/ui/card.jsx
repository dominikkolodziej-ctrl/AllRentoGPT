import React from 'react';
import PropTypes from 'prop-types';

// src/components/ui/card.jsx
const Card = ({ children, className = "" }) => {
  return (
    <div className={`rounded shadow-md p-4 bg-white ${className}`}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Card;

// ✅ FAZA 12 – mikro-status (komponent opakowujący treść)
