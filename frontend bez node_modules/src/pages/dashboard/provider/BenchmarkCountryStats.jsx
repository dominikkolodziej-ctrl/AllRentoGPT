// src/pages/admin/BenchmarkCountryStats.jsx
import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAdmin } from '@/context/AdminContext.jsx';
import TimeRangeSelector from '@/components/admin/TimeRangeSelector.jsx';

export default function BenchmarkCountryStats() {
  const admin = useAdmin() ?? {};
  const [fallbackRange, setFallbackRange] = useState({ preset: 'last30', from: '', to: '' });
  const range = admin.timeRange ?? fallbackRange;
  const setRange = admin.setTimeRange ?? setFallbackRange;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (signal) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (range.from) params.set('from', range.from);
      if (range.to) params.set('to', range.to);
      if (range.preset) params.set('preset', range.preset);

      const res = await fetch(`/api/admin/benchmark/countries?${params.toString()}`, { signal });
      if (!res.ok) {
        let msg = 'Błąd pobierania statystyk';
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
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (err) {
      if (signal?.aborted) return;
      toast.error(err?.message || 'Błąd pobierania statystyk');
      setData([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [range.from, range.to, range.preset]);

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">📊 Benchmark: Kraje vs. Kraje</h2>

      <TimeRangeSelector range={range} setRange={setRange} />

      {loading ? (
        <p role="status" aria-busy="true">Ładowanie...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Kraj</th>
                <th>Oferty aktywne</th>
                <th>Śr. ocena firm</th>
                <th>Przychód miesięczny</th>
                <th>CTR promowanych</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.countryCode || i}>
                  <td>{row.countryLabel}</td>
                  <td>{row.activeOffers}</td>
                  <td>{row.avgRating}</td>
                  <td>{row.monthlyRevenue}</td>
                  <td>{typeof row.promotedCTR === 'number' ? `${row.promotedCTR}%` : row.promotedCTR}</td>
                </tr>
              ))}
              {!data.length && (
                <tr>
                  <td colSpan={5} className="text-center opacity-70">Brak danych dla wybranego zakresu.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
