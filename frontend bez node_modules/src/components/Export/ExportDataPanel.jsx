// Ścieżka: components/export/ExportDataPanel.jsx
import React, { useState } from 'react';

import ExportButtonGroup from "@/components/Export/ExportButtonGroup.jsx";

const ExportDataPanel = () => {
  const [selected, setSelected] = useState({
    offers: true,
    companies: false,
    users: false,
    messages: false,
    alerts: false,
    plans: false
  });

  const toggle = (key) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-4 border rounded bg-gray-50 space-y-4">
      <h2 className="font-bold text-lg">Eksport danych</h2>
      <div className="grid grid-cols-2 gap-3">
        {Object.keys(selected).map((key) => (
          <label key={key} className="flex items-center gap-2">
            <input type="checkbox" checked={selected[key]} onChange={() => toggle(key)} />
            <span>{key}</span>
          </label>
        ))}
      </div>
      <ExportButtonGroup selected={selected} />
    </div>
  );
};

export default ExportDataPanel;
