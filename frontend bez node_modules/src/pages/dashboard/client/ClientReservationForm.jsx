// src/pages/client/ClientReservationForm.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

const ClientReservationForm = ({ availableDates = [] }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAvailable = (date) => availableDates.includes(date);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!from || !to) {
      toast.error('Wybierz daty od i do.');
      return;
    }
    if (from > to) {
      toast.error('Data „od” nie może być po dacie „do”.');
      return;
    }
    if (!isAvailable(from) || !isAvailable(to)) {
      toast.error('Wybrano niedostępny termin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to }),
      });
      if (!res.ok) {
        let message = 'Błąd rezerwacji';
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
      toast.success(`Zarezerwowano od ${from} do ${to}`);
      setFrom('');
      setTo('');
    } catch (err) {
      toast.error(err?.message || 'Błąd rezerwacji');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-2 border rounded">
      <label htmlFor="from" className="font-medium">
        Od:
      </label>
      <input
        id="from"
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="w-full p-2 border rounded"
        aria-label="Data rozpoczęcia"
      />

      <label htmlFor="to" className="font-medium">
        Do:
      </label>
      <input
        id="to"
        type="date"
        value={to}
        min={from || undefined}
        onChange={(e) => setTo(e.target.value)}
        className="w-full p-2 border rounded"
        aria-label="Data zakończenia"
      />

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
        disabled={isSubmitting}
        aria-disabled={isSubmitting}
      >
        {isSubmitting ? 'Rezerwuję…' : 'Rezerwuj'}
      </button>
    </form>
  );
};

ClientReservationForm.propTypes = {
  availableDates: PropTypes.arrayOf(PropTypes.string),
};

export default ClientReservationForm;
