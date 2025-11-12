import React from 'react';
import { useEffect, useState } from "react";

export default function CalendarSyncSettings() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch("/api/calendar/status")
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(() => setStatus(null));
  }, []);

  const handleConnect = async (provider) => {
    window.location.href = `/api/calendar/connect?provider=${provider}`;
  };

  return (
    <div className="p-4 border bg-white rounded shadow-sm">
      <h3 className="font-semibold mb-2">Synchronizacja kalendarza</h3>
      <p className="text-sm mb-2 text-gray-600">
        Aktualny status: {status?.connected ? `Połączono z ${status.provider}` : "Brak połączenia"}
      </p>
      <div className="flex gap-3">
        <button onClick={() => handleConnect("google")} className="bg-blue-600 text-white px-3 py-1 rounded">
          Połącz z Google
        </button>
        <button onClick={() => handleConnect("outlook")} className="bg-gray-800 text-white px-3 py-1 rounded">
          Połącz z Outlook
        </button>
      </div>
    </div>
  );
}