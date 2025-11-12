import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const CalloutBox = ({ message, tone = "info" }) => {
  const toneClass = {
    info: "bg-blue-100 text-blue-900",
    success: "bg-green-100 text-green-900",
    warning: "bg-yellow-100 text-yellow-900",
    danger: "bg-red-100 text-red-900"
  };

  return (
    <div className={clsx("p-4 rounded", toneClass[tone])}>
      {message}
    </div>
  );
};

CalloutBox.propTypes = {
  message: PropTypes.node.isRequired,
  tone: PropTypes.oneOf(["info", "success", "warning", "danger"])
};

export default CalloutBox;

// ✅ FAZA 12 – mikro-status (różne tony wiadomości)
