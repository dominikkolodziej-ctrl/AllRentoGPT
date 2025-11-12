// Ścieżka: src/components/Admin/AuditTrailPanel.tsx
import React, { useEffect, useState } from 'react';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

type AuditLogEntry = {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  changes?: unknown;
};

const AuditTrailPanel = () => {
  const { t } = useLiveText(); // ✅ zgodnie z rzeczywistym typem
  const { theme } = useTheme();

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/audit");
        const data = await res.json();
        setLogs(data);
      } catch {
        setError(true);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className={`max-w-3xl p-4 shadow rounded ${theme.bgCard} ${theme.textPrimary}`}>
      <h3 className="text-lg font-bold mb-3">🕵️ {t("audit.history.title") ?? "Historia zmian"}</h3>

      {error && (
        <div className="text-sm text-red-500 mb-2">
          {t("audit.history.error") ?? "Nie udało się pobrać historii zmian."}
        </div>
      )}

      <ul className="space-y-2 text-sm">
        {logs.map((log) => (
          <li key={log.id} className="border-b pb-2">
            <div>
              <strong>{log.userId}</strong> {t("audit.action") ?? "wykonał"} <strong>{log.action}</strong> {t("audit.on") ?? "na"} <strong>{log.entity}</strong> (ID: {log.entityId})
            </div>
            <div className="text-xs text-gray-500">{log.timestamp}</div>

            {typeof log.changes === "object" && log.changes !== null && !Array.isArray(log.changes) ? (
              <pre className="bg-gray-100 p-2 mt-1 rounded">
                {JSON.stringify(log.changes, null, 2)}
              </pre>
            ) : typeof log.changes === "string" ? (
              <pre className="bg-gray-100 p-2 mt-1 rounded text-orange-700">
                {log.changes}
              </pre>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AuditTrailPanel;
