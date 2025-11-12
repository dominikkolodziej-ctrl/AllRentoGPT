// src/pages/admin/LiveActivityMonitor.jsx
import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAdmin } from '@/context/AdminContext.jsx';
import CountryContextSwitcher from '@/components/admin/CountryContextSwitcher.jsx';

export default function LiveActivityMonitor() {
  const [users, setUsers] = useState([]);
  const { selectedCountry, setSelectedCountry } = useAdmin();

  const apiFetch = useCallback(async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      if (res.status === 401) {
        toast.error('Sesja wygasła. Zaloguj się ponownie.');
        return null;
      }
      if (!res.ok) {
        let msg = 'Błąd pobierania aktywności';
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const j = await res.json();
            msg = j?.message || msg;
          } else {
            msg = await res.text();
          }
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      return res.json();
    } catch (err) {
      toast.error(err?.message || 'Błąd sieci');
      return null;
    }
  }, []);

  const load = useCallback(async (signal) => {
    const data = await apiFetch(`/api/admin/activity/live?country=${encodeURIComponent(selectedCountry)}`, { signal });
    if (Array.isArray(data)) setUsers(data);
  }, [apiFetch, selectedCountry]);

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    const interval = setInterval(() => load(ac.signal), 15000);
    return () => {
      clearInterval(interval);
      ac.abort();
    };
  }, [load]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">🧠 Aktywność użytkowników (live)</h2>
      <p className="text-gray-600">
        Widok aktywnych użytkowników w kraju: <strong>{selectedCountry}</strong>
      </p>

      <CountryContextSwitcher country={selectedCountry} setCountry={setSelectedCountry} />

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th scope="col">Użytkownik</th>
              <th scope="col">Rola</th>
              <th scope="col">Lokalizacja</th>
              <th scope="col">Widok</th>
              <th scope="col">Start sesji</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i}>
                <td>{u.name || u.email}</td>
                <td>{u.role}</td>
                <td>{u.country}</td>
                <td>{u.page}</td>
                <td>{u.startTime ? new Date(u.startTime).toLocaleTimeString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
