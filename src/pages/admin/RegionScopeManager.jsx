import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const availableRegions = ['PL - Polska', 'DE - Niemcy', 'UK - Wielka Brytania', 'ES - Hiszpania', 'US - USA'];

export default function RegionScopeManager() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const apiFetch = useCallback(async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      if (res.status === 401) {
        toast.error('Sesja wygasła. Zaloguj się ponownie.');
        return null;
      }
      if (!res.ok) {
        let message = 'Wystąpił błąd';
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
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) return res.json();
      return null;
    } catch (err) {
      toast.error(err?.message || 'Błąd sieci');
      return null;
    }
  }, []);

  const loadCompanies = useCallback(
    async (signal) => {
      const data = await apiFetch('/api/admin/companies', { signal });
      if (Array.isArray(data)) setCompanies(data);
      setLoading(false);
    },
    [apiFetch]
  );

  useEffect(() => {
    const ac = new AbortController();
    loadCompanies(ac.signal);
    return () => ac.abort();
  }, [loadCompanies]);

  const handleRegionChange = async (companyId, region) => {
    if (!companyId) return;
    setUpdatingId(companyId);
    const ok = await apiFetch(`/api/admin/companies/${encodeURIComponent(companyId)}/region`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ region }),
    });
    setUpdatingId(null);
    if (ok !== null) {
      setCompanies((prev) => prev.map((c) => (c._id === companyId ? { ...c, region } : c)));
      toast.success('Zmieniono region');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🌐 Zarządzanie regionami</h2>
      {loading ? (
        <p>Ładowanie...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Firma</th>
                <th>Email</th>
                <th>Obecny region</th>
                <th>Zmień region</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.region || '-'}</td>
                  <td>
                    <select
                      className="select select-bordered"
                      value={c.region || ''}
                      onChange={(e) => handleRegionChange(c._id, e.target.value)}
                      aria-label={`Zmień region dla ${c.name}`}
                      disabled={updatingId === c._id}
                    >
                      <option value="">Wybierz region</option>
                      {availableRegions.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
