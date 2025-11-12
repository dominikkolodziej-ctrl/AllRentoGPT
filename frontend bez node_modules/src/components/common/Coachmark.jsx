import PropTypes from 'prop-types';
import React from 'react';

const Coachmark = ({ children, active, message }) => {
  return (
    <div className="relative inline-block">
      {children}
      {active && (
        <div className="absolute -top-10 left-0 bg-yellow-100 text-sm p-2 rounded shadow z-50 w-56">
          {message}
        </div>
      )}
    </div>
  );
};

Coachmark.propTypes = {
  children: PropTypes.any,
  active: PropTypes.bool,
  message: PropTypes.string,
};

export default Coachmark;
