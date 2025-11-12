import PropTypes from 'prop-types';
import React from 'react';
import useExport from '@/hooks/useExport.ts'; // ← default import (było: { useExport })

const ExportButton = ({ type }) => {
  const { exportData } = useExport();

  // akceptuj string lub obiekt {key:boolean}
  const toSelected = (val) => (typeof val === 'string' ? { [val]: true } : val);

  return (
    <div className="inline-flex gap-2">
      <button
        onClick={() => exportData(toSelected(type), 'csv')}
        className="px-2 py-1 bg-blue-100 rounded text-sm"
      >
        CSV
      </button>
      <button
        onClick={() => exportData(toSelected(type), 'pdf')}
        className="px-2 py-1 bg-red-100 rounded text-sm"
      >
        PDF
      </button>
    </div>
  );
};

ExportButton.propTypes = {
  type: PropTypes.any,
};

export default ExportButton;
