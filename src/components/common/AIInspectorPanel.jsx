import PropTypes from 'prop-types';
import React from 'react';

const AIInspectorPanel = ({ result }) => {
  if (!result) return <div>Brak analizy AI.</div>;

  return (
    <div className="p-4 border rounded bg-gray-50 text-sm space-y-1">
      <div><strong>🎯 Ocena jakości:</strong> {result.qualityScore} / 100</div>
      <div><strong>📦 Klasa:</strong> {result.tier}</div>
      <div><strong>🏷️ Tagi:</strong> {result.flags.join(', ') || 'Brak'}</div>
    </div>
  );
};

export default AIInspectorPanel;
// ESLINT FIX: Added PropTypes

AIInspectorPanel.propTypes = {
  result: PropTypes.any,
};
