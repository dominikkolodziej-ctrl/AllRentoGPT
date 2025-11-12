import PropTypes from 'prop-types';
import React from 'react';

const StatusIndicator = ({ status }) => {
  const color =
    status === 'ok' ? 'bg-green-500' :
    status === 'degraded' ? 'bg-yellow-500' :
    status === 'down' ? 'bg-red-500' :
    'bg-gray-400';

  return <span className={`inline-block w-3 h-3 rounded-full ${color}`}></span>;
};

export default StatusIndicator;
// ESLINT FIX: Added PropTypes

StatusIndicator.propTypes = {
  status: PropTypes.any,
};
