// src/pages/admin/SystemAuditLog.jsx
import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export default function SystemAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiFetch = useCallback(async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      if (res.status === 401) {
        toast.error('Sesja wygasła. Zaloguj się ponownie.');
        return null;
      }
      if (!res.ok) {
        let message = 'Nie udało się pobrać logów';
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const j = await res.json();
            message = j?.message || message;
          } else {
            message = await res.text();
          }
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }
      return res.json();
    } catch (err) {
      toast.error(err?.message || 'Błąd sieci');
      return null;
    }
  }, []);

  const loadLogs = useCallback(
    async (signal) => {
      setLoading(true);
      const data = await apiFetch('/api/admin/audit-log', { signal });
      setLogs(Array.isArray(data) ? data : []);
      setLoading(false);
    },
    [apiFetch]
  );

  useEffect(() => {
    const ac = new AbortController();
    loadLogs(ac.signal);
    return () => ac.abort();
  }, [loadLogs]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📝 Log działań administratorów</h2>
      {loading ? (
        <p>Ładowanie...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th scope="col">Data</th>
                <th scope="col">Administrator</th>
                <th scope="col">Akcja</th>
                <th scope="col">Szczegóły</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={log.id || i}>
                  <td>{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
                  <td>{log.adminName || log.adminEmail || '-'}</td>
                  <td>{log.action || '-'}</td>
                  <td>{log.details || '-'}</td>
                </tr>
              ))}
              {!logs.length && (
                <tr>
                  <td colSpan={4} className="text-center opacity-70">
                    Brak wpisów w dzienniku.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
