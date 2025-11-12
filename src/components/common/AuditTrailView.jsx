import PropTypes from 'prop-types';
import React from 'react';
import { useAuditTrail } from '@/hooks/useAuditTrail.js';

const AuditTrailView = ({ entity, entityId }) => {
  const logs = useAuditTrail(entity, entityId);

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-2">📑 Historia zmian</h3>
      {logs.length === 0 ? <p>Brak zmian.</p> : (
        <ul className="text-sm space-y-2">
          {logs.map((log, idx) => (
            <li key={idx} className="border p-2 rounded bg-gray-50">
              <div><strong>{log.action}</strong> przez {log.user || 'system'}</div>
              <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</div>
              {log.before && log.after && (
                <pre className="text-xs mt-1 bg-white p-1 overflow-auto max-h-40">{JSON.stringify({ before: log.before, after: log.after }, null, 2)}</pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AuditTrailView;
// ESLINT FIX: Added PropTypes

AuditTrailView.propTypes = {
  entity: PropTypes.any,
  entityId: PropTypes.any,
};
