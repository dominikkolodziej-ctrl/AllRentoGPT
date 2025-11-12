// src/pages/client/ClientReservations.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ClientReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await axios.get('/api/reservations/my', { signal: ac.signal });
        setReservations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (ac.signal.aborted) return;
        const msg = err?.response?.data?.message || 'Nie udało się pobrać rezerwacji';
        toast.error(msg);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  if (loading) return <div className="p-4" role="status" aria-busy="true">⏳ Ładowanie rezerwacji...</div>;

  if (!reservations.length) return <div className="p-4">🔍 Brak aktywnych rezerwacji</div>;

  return (
    <section className="space-y-4" aria-labelledby="client-reservations-heading">
      <h3 id="client-reservations-heading" className="text-xl font-bold">📅 Twoje rezerwacje</h3>
      {reservations.map((r, i) => (
        <article key={r._id || i} className="p-4 border rounded shadow bg-white">
          <div className="font-semibold">{r.asset?.name || 'Zasób'}</div>
          <div className="text-sm text-gray-600">
            📅 {r.from} → {r.to}
          </div>
          <div className="text-sm text-gray-500">Status: {r.status}</div>
        </article>
      ))}
    </section>
  );
};

export default ClientReservations;
