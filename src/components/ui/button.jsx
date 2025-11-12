import React from 'react';
import PropTypes from 'prop-types';

// src/components/ui/button.jsx
const Button = ({ children, onClick, className = "", type = "button" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 ${className}`}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  className: PropTypes.string,
  type: PropTypes.string,
};

export default Button;
export { Button };

// ✅ FAZA 12 – mikro-status (button: type, hover, styling)
// 🔹 ESLint: doprecyzowano PropTypes.children → PropTypes.node
