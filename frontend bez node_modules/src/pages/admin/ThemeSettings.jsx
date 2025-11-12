// src/pages/admin/ThemeSettings.jsx
import { useTheme } from '@/context/ThemeContext.jsx';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ThemeSettings() {
  const ui = useTheme();
  const [form, setForm] = useState({
    primaryColor: '#2563eb',
    backgroundColor: '#ffffff',
    logoUrl: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    fetch('/api/settings/theme', { signal: ac.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Nie udało się pobrać ustawień motywu');
        return res.json();
      })
      .then((data) =>
        setForm({
          primaryColor: data?.primaryColor || '#2563eb',
          backgroundColor: data?.backgroundColor || '#ffffff',
          logoUrl: data?.logoUrl || '',
        })
      )
      .catch(() => toast.error('Nie udało się pobrać ustawień motywu'));
    return () => ac.abort();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveTheme = async () => {
    const payload = {
      primaryColor: (form.primaryColor || '').trim(),
      backgroundColor: (form.backgroundColor || '').trim(),
      logoUrl: (form.logoUrl || '').trim(),
    };
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings/theme', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Błąd zapisu motywu');
      toast.success('Zapisano ustawienia wyglądu');
      try {
        window.dispatchEvent(new CustomEvent('app:theme-updated', { detail: payload }));
      } catch {
        /* ignore */
      }
    } catch (err) {
      toast.error(err.message || 'Błąd zapisu motywu');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`p-6 max-w-4xl mx-auto space-y-6 ${ui.background} ${ui.text}`}>
      <h2 className="text-2xl font-bold">🎨 Personalizacja wyglądu aplikacji</h2>
      <p className="text-gray-600">
        Ustaw kolory, tło i logo systemu widoczne dla wszystkich użytkowników.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label" htmlFor="primaryColor">
            <span className="label-text">Kolor główny</span>
          </label>
          <input
            id="primaryColor"
            type="color"
            name="primaryColor"
            value={form.primaryColor}
            onChange={handleChange}
            className="input input-bordered w-full"
            aria-label="Kolor główny"
          />
        </div>
        <div>
          <label className="label" htmlFor="backgroundColor">
            <span className="label-text">Kolor tła</span>
          </label>
          <input
            id="backgroundColor"
            type="color"
            name="backgroundColor"
            value={form.backgroundColor}
            onChange={handleChange}
            className="input input-bordered w-full"
            aria-label="Kolor tła"
          />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="logoUrl">
            <span className="label-text">URL logo (https://...)</span>
          </label>
          <input
            id="logoUrl"
            type="text"
            name="logoUrl"
            value={form.logoUrl}
            onChange={handleChange}
            className="input input-bordered w-full"
            aria-label="Adres URL logo"
            placeholder="https://example.com/logo.png"
          />
        </div>
      </div>

      <div>
        <button
          className="btn btn-primary"
          onClick={saveTheme}
          type="button"
          disabled={isSaving}
          aria-disabled={isSaving}
        >
          {isSaving ? 'Zapisywanie…' : 'Zapisz motyw'}
        </button>
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="text-lg font-semibold">Podgląd:</h3>
        <div
          className="p-4 rounded border"
          style={{ backgroundColor: form.backgroundColor }}
        >
          <button
            type="button"
            className="btn"
            style={{ backgroundColor: form.primaryColor, borderColor: form.primaryColor }}
          >
            Przykładowy przycisk
          </button>
        </div>

        <div>
          <h4 className="font-medium mb-2">Podgląd logo:</h4>
          {form.logoUrl ? (
            <img src={form.logoUrl} alt="Podgląd logo" className="h-16" />
          ) : (
            <div className="text-sm opacity-70">Brak logo</div>
          )}
        </div>
      </div>
    </div>
  );
}
