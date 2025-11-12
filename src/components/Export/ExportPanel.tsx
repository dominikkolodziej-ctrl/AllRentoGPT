// Ścieżka: src/components/Export/ExportPanel.tsx
import React from 'react';

const ExportPanel = () => {
  const download = (type: 'csv' | 'pdf') => {
    const url = `/api/export/${type}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex gap-4">
      <button onClick={() => download("csv")} className="bg-green-600 text-white px-4 py-2 rounded">
        Eksport CSV
      </button>
      <button onClick={() => download("pdf")} className="bg-blue-600 text-white px-4 py-2 rounded">
        Eksport PDF
      </button>
    </div>
  );
};

export default ExportPanel;
