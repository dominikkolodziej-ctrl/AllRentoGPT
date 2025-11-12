// src/pages/admin/SystemAlertSender.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';

// ✅ FAZA 6: Inbox & komunikacja – wysyłka alertów systemowych

export default function SystemAlertSender() {
  const [form, setForm] = useState({
    title: '',
    message: '',
    audience: 'all',
    country: '',
    scheduleAt: '',
  });
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = () => {
    const title = (form.title || '').trim();
    const message = (form.message || '').trim();
    const audience = form.audience || 'all';
    const country = form.country || '';
    const scheduleAtISO =
      form.scheduleAt ? new Date(form.scheduleAt).toISOString() : undefined;

    const payload = { title, message, audience };
    if (country) payload.country = country;
    if (scheduleAtISO) payload.scheduleAt = scheduleAtISO;
    return payload;
  };

  const sendAlert = async () => {
    const payload = buildPayload();
    if (!payload.title) {
      toast.error('Podaj tytuł komunikatu');
      return;
    }
    if (!payload.message) {
      toast.error('Podaj treść komunikatu');
      return;
    }
    setIsSending(true);
    try {
      const res = await fetch('/api/admin/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let msg = 'Błąd wysyłki alertu';
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
      toast.success('Alert wysłany');
      try {
        window.dispatchEvent(new CustomEvent('app:alert-sent', { detail: payload }));
      } catch {
        /* ignore */
      }
      setForm({
        title: '',
        message: '',
        audience: 'all',
        country: '',
        scheduleAt: '',
      });
    } catch (err) {
      toast.error(err?.message || 'Błąd wysyłki alertu');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">📢 Wysyłka powiadomień systemowych</h2>
      <p className="text-gray-600">
        Wyślij ważny komunikat do wybranej grupy użytkowników lub regionu.
      </p>

      <label className="label" htmlFor="alert-title">
        <span className="label-text">Tytuł</span>
      </label>
      <input
        id="alert-title"
        name="title"
        className="input input-bordered w-full"
        placeholder="Tytuł"
        value={form.title}
        onChange={handleChange}
        aria-label="Tytuł komunikatu"
      />

      <label className="label" htmlFor="alert-message">
        <span className="label-text">Treść komunikatu</span>
      </label>
      <textarea
        id="alert-message"
        name="message"
        className="textarea textarea-bordered w-full"
        placeholder="Treść komunikatu"
        rows={4}
        value={form.message}
        onChange={handleChange}
        aria-label="Treść komunikatu"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="alert-audience">
            <span className="label-text">Grupa docelowa</span>
          </label>
          <select
            id="alert-audience"
            name="audience"
            className="select select-bordered w-full"
            value={form.audience}
            onChange={handleChange}
            aria-label="Grupa docelowa"
          >
            <option value="all">Wszyscy</option>
            <option value="providers">Firmy</option>
            <option value="clients">Użytkownicy</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="alert-country">
            <span className="label-text">Kraj docelowy (opcjonalnie)</span>
          </label>
          <select
            id="alert-country"
            name="country"
            className="select select-bordered w-full"
            value={form.country}
            onChange={handleChange}
            aria-label="Kraj docelowy"
          >
            <option value="">Wszystkie</option>
            <option value="PL">Polska</option>
            <option value="DE">Niemcy</option>
            <option value="FR">Francja</option>
            <option value="ES">Hiszpania</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="label" htmlFor="alert-scheduleAt">
            <span className="label-text">Data i godzina wysyłki (opcjonalnie)</span>
          </label>
          <input
            id="alert-scheduleAt"
            type="datetime-local"
            name="scheduleAt"
            className="input input-bordered w-full"
            value={form.scheduleAt}
            onChange={handleChange}
            aria-label="Data i godzina wysyłki"
          />
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={sendAlert}
        type="button"
        disabled={isSending || !form.title.trim() || !form.message.trim()}
        aria-disabled={isSending || !form.title.trim() || !form.message.trim()}
      >
        {isSending ? 'Wysyłanie…' : 'Wyślij komunikat'}
      </button>
    </div>
  );
}
