import PropTypes from 'prop-types';
import React from 'react';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1

const AlertTag = ({ type }) => {
  const { t } = useLiveText("alerts");
  const colorMap = {
    spam: "bg-yellow-100 text-yellow-800",
    duplikat: "bg-red-100 text-red-800",
    bot: "bg-purple-100 text-purple-800",
    system: "bg-gray-100 text-gray-800"
  };

  return (
    <span className={`px-2 py-1 text-xs rounded ${colorMap[type] || "bg-blue-100 text-blue-800"}`}>
      {t(`type.${type}`, type.toUpperCase())} {/* ✅ FAZA 1 */}
    </span>
  );
};

AlertTag.propTypes = {
  type: PropTypes.any,
};

export default AlertTag;
