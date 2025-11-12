import PropTypes from 'prop-types';
import React from 'react';

const ALERT_COLORS = {
  spam: 'bg-red-100 text-red-800',
  duplicate: 'bg-yellow-100 text-yellow-800',
  suspicious: 'bg-orange-100 text-orange-800',
  low_ctr: 'bg-blue-100 text-blue-800',
  missing: 'bg-gray-100 text-gray-800',
};

const AlertTag = ({ type }) => {
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${ALERT_COLORS[type] || 'bg-gray-200'}`}>
      🛑 {type.replace('_', ' ')}
    </span>
  );
};

export default AlertTag;
// ESLINT FIX: Added PropTypes

AlertTag.propTypes = {
  type: PropTypes.any,
};
