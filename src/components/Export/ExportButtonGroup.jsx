import PropTypes from 'prop-types';
import React from 'react';
// Ścieżka: components/export/ExportButtonGroup.jsx

import useExport from "@/hooks/useExport.ts";

const ExportButtonGroup = ({ selected }) => {
  const { exportData } = useExport();

  return (
    <div className="flex gap-3 mt-2">
      {["csv", "pdf", "json"].map((type) => (
        <button key={type} onClick={() => exportData(selected, type)} className="text-sm px-3 py-1 border rounded">
          Eksportuj do {type.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default ExportButtonGroup;
// ESLINT FIX: Added PropTypes

ExportButtonGroup.propTypes = {
  selected: PropTypes.any,
};
