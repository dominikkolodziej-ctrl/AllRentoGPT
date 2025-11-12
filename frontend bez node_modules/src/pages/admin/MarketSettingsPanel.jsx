import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export default function MarketSettingsPanel() {
  const [country, setCountry] = useState('PL');
  const [settings, setSettings] = useState({
    currency: 'PLN',
    language: 'pl',
    planDescription: '',
    weeklyPromo: '',
  });
  const [isSaving, setIsSaving] = useState(false);

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

  const loadSettings = useCallback(
    async (signal) => {
      const data = await apiFetch(`/api/admin/market/${encodeURIComponent(country)}`, { signal });
      if (data) {
        setSettings({
          currency: (data.currency ?? 'PLN').toString(),
          language: (data.language ?? 'pl').toString(),
          planDescription: (data.planDescription ?? '').toString(),
          weeklyPromo: (data.weeklyPromo ?? '').toString(),
        });
      }
    },
    [apiFetch, country]
  );

  useEffect(() => {
    const ac = new AbortController();
    loadSettings(ac.signal);
    return () => ac.abort();
  }, [loadSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    const payload = {
      ...settings,
      currency: (settings.currency || '').trim().toUpperCase(),
      language: (settings.language || 'pl').trim(),
    };
    if (!payload.currency) {
      toast.error('Waluta jest wymagana.');
      return;
    }
    setIsSaving(true);
    const ok = await apiFetch(`/api/admin/market/${encodeURIComponent(country)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setIsSaving(false);
    if (ok !== null) {
      toast.success('Zapisano ustawienia rynku');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">🌐 Ustawienia rynku</h2>

      <div>
        <label className="label" htmlFor="market-country">
          <span className="label-text">Kraj</span>
        </label>
        <select
          id="market-country"
          className="select select-bordered"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          aria-label="Wybierz kraj"
        >
          <option value="PL">Polska 🇵🇱</option>
          <option value="DE">Niemcy 🇩🇪</option>
          <option value="FR">Francja 🇫🇷</option>
          <option value="ES">Hiszpania 🇪🇸</option>
        </select>
      </div>

      <div>
        <label className="label" htmlFor="market-language">
          <span className="label-text">Język</span>
        </label>
        <select
          id="market-language"
          name="language"
          className="select select-bordered w-full"
          value={settings.language}
          onChange={handleChange}
          aria-label="Wybierz język rynku"
        >
          <option value="pl">Polski</option>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="de">Deutsch</option>
        </select>
      </div>

      <div>
        <label className="label" htmlFor="market-currency">
          <span className="label-text">Waluta</span>
        </label>
        <input
          id="market-currency"
          name="currency"
          className="input input-bordered w-full"
          value={settings.currency}
          onChange={handleChange}
          aria-label="Waluta rynku (np. PLN, EUR)"
          maxLength={3}
        />
      </div>

      <div>
        <label className="label" htmlFor="market-planDescription">
          <span className="label-text">Opis planów subskrypcyjnych</span>
        </label>
        <textarea
          id="market-planDescription"
          name="planDescription"
          rows={3}
          className="textarea textarea-bordered w-full"
          value={settings.planDescription}
          onChange={handleChange}
          aria-label="Opis planów subskrypcyjnych"
        />
      </div>

      <div>
        <label className="label" htmlFor="market-weeklyPromo">
          <span className="label-text">Promocja tygodnia</span>
        </label>
        <input
          id="market-weeklyPromo"
          name="weeklyPromo"
          className="input input-bordered w-full"
          value={settings.weeklyPromo}
          onChange={handleChange}
          aria-label="Promocja tygodnia"
        />
      </div>

      <button className="btn btn-primary" onClick={save} type="button" disabled={isSaving}>
        {isSaving ? 'Zapisywanie…' : '💾 Zapisz'}
      </button>
    </div>
  );
}
