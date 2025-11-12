// src/pages/admin/ThemeSettingsDraftable.jsx
import { useTheme } from '@/context/ThemeContext.jsx';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// ✅ FAZA 7: Wersje robocze wyglądu (staging)

export default function ThemeSettingsDraftable() {
  const ui = useTheme();
  const [draft, setDraft] = useState({ color: '', logo: '', banner: '', published: false });
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    fetch('/api/admin/theme-draft', { signal: ac.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Błąd ładowania wersji roboczej');
        return res.json();
      })
      .then(setDraft)
      .catch(() => toast.error('Błąd ładowania wersji roboczej'));
    return () => ac.abort();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDraft((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/theme-draft', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error('Błąd zapisu roboczego');
      toast.success('Wersja robocza zapisana');
      try {
        window.dispatchEvent(new CustomEvent('app:theme-draft-saved', { detail: draft }));
      } catch {
        /* ignore */
      }
    } catch (err) {
      toast.error(err.message || 'Błąd zapisu roboczego');
    } finally {
      setIsSaving(false);
    }
  };

  const publish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch('/api/admin/theme-draft/publish', { method: 'POST' });
      if (!res.ok) throw new Error('Błąd publikacji');
      toast.success('Zmieniony wygląd został opublikowany');
      setDraft((prev) => ({ ...prev, published: true }));
      try {
        window.dispatchEvent(new CustomEvent('app:theme-published'));
      } catch {
        /* ignore */
      }
    } catch (err) {
      toast.error(err.message || 'Błąd publikacji');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className={`p-6 max-w-4xl mx-auto space-y-4 ${ui.background} ${ui.text}`}>
      <h2 className="text-2xl font-bold">🎨 Wygląd systemu – wersja robocza</h2>
      <p className="text-gray-600">Możesz edytować styl aplikacji i zobaczyć podgląd przed publikacją.</p>

      <div className="form-control">
        <label className="label" htmlFor="theme-color">
          <span className="label-text">Kolor główny</span>
        </label>
        <input
          id="theme-color"
          name="color"
          className="input input-bordered"
          placeholder="#2563eb"
          value={draft.color}
          onChange={handleChange}
          aria-label="Kolor główny"
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="theme-logo">
          <span className="label-text">URL logo</span>
        </label>
        <input
          id="theme-logo"
          name="logo"
          className="input input-bordered"
          placeholder="https://example.com/logo.png"
          value={draft.logo}
          onChange={handleChange}
          aria-label="Adres URL logo"
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="theme-banner">
          <span className="label-text">URL bannera</span>
        </label>
        <input
          id="theme-banner"
          name="banner"
          className="input input-bordered"
          placeholder="https://example.com/banner.jpg"
          value={draft.banner}
          onChange={handleChange}
          aria-label="Adres URL bannera"
        />
      </div>

      <label className="label cursor-pointer" htmlFor="theme-published">
        <span className="label-text">Oznacz jako opublikowane</span>
        <input
          id="theme-published"
          type="checkbox"
          name="published"
          className="toggle"
          checked={Boolean(draft.published)}
          onChange={handleChange}
          aria-checked={Boolean(draft.published)}
        />
      </label>

      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setPreviewMode((v) => !v)}
          aria-pressed={previewMode}
        >
          {previewMode ? 'Wyłącz podgląd' : 'Podgląd'}
        </button>
        <button
          type="button"
          className="btn"
          onClick={saveDraft}
          disabled={isSaving}
          aria-disabled={isSaving}
        >
          {isSaving ? 'Zapisywanie…' : '💾 Zapisz roboczo'}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={publish}
          disabled={isPublishing}
          aria-disabled={isPublishing}
        >
          {isPublishing ? 'Publikowanie…' : '🚀 Opublikuj zmiany'}
        </button>
      </div>

      {previewMode && (
        <div className="border mt-6 p-4 rounded-xl bg-base-200">
          <h3 className="text-xl font-bold">🔍 Podgląd:</h3>
          <p>
            Kod koloru: <span className="font-mono">{draft.color || '—'}</span>
          </p>
          {draft.logo ? (
            <img src={draft.logo} alt="Logo" className="h-12 my-2" />
          ) : (
            <div className="text-sm opacity-70 my-2">Brak logo</div>
          )}
          {draft.banner ? (
            <img src={draft.banner} alt="Banner" className="w-full h-32 object-cover rounded" />
          ) : (
            <div className="text-sm opacity-70">Brak bannera</div>
          )}
        </div>
      )}
    </div>
  );
}
