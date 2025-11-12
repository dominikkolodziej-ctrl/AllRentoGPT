import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export default function ExportTemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState({ name: '', columns: '' });
  const [isSaving, setIsSaving] = useState(false);

  const apiFetch = useCallback(async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      if (res.status === 401) {
        toast.error('Sesja wygasła. Zaloguj się ponownie.');
        window.location.assign('/login');
        return null;
      }
      if (!res.ok) {
        let message = 'Wystąpił błąd';
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const errJson = await res.json();
            message = errJson?.message || message;
          } else {
            message = await res.text();
          }
        } catch {
          /* ignore parsing error */
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

  const loadTemplates = useCallback(
    async (signal) => {
      const data = await apiFetch('/api/admin/export-templates', { signal });
      if (Array.isArray(data)) setTemplates(data);
    },
    [apiFetch]
  );

  const saveTemplate = async () => {
    const name = newTemplate.name.trim();
    const columns = newTemplate.columns
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .join(', ');
    if (!name || !columns) {
      toast.error('Uzupełnij nazwę i kolumny.');
      return;
    }
    setIsSaving(true);
    const created = await apiFetch('/api/admin/export-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, columns }),
    });
    setIsSaving(false);
    if (created) {
      toast.success('Zapisano szablon');
      setNewTemplate({ name: '', columns: '' });
      await loadTemplates();
    }
  };

  const deleteTemplate = async (id) => {
    if (!id) return;
    const ok = await apiFetch(`/api/admin/export-templates/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (ok !== null) {
      toast.success('Usunięto szablon');
      await loadTemplates();
    }
  };

  const exportTemplatesToCSV = () => {
    if (!templates.length) {
      toast.error('Brak szablonów do eksportu.');
      return;
    }
    const rows = [['name', 'columns']];
    templates.forEach((t) => {
      const cols = Array.isArray(t.columns) ? t.columns.join(' | ') : String(t.columns || '');
      rows.push([String(t.name || ''), cols]);
    });
    const csv = rows
      .map((r) =>
        r
          .map((cell) => {
            const s = String(cell ?? '');
            const needsQuotes = s.includes(',') || s.includes('"') || s.includes('\n');
            const escaped = s.replace(/"/g, '""');
            return needsQuotes ? `"${escaped}"` : escaped;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `export_templates_${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  useEffect(() => {
    const ac = new AbortController();
    loadTemplates(ac.signal);
    return () => ac.abort();
  }, [loadTemplates]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">📄 Szablony eksportu danych</h2>
      <p className="text-gray-600">Zarządzaj strukturą eksportowanych danych do CSV/PDF.</p>

      <div className="space-y-2">
        <label className="label" htmlFor="template-name">
          <span className="label-text">Nazwa szablonu</span>
        </label>
        <input
          id="template-name"
          className="input input-bordered w-full"
          placeholder="Nazwa szablonu"
          value={newTemplate.name}
          onChange={(e) => setNewTemplate((prev) => ({ ...prev, name: e.target.value }))}
          aria-label="Nazwa szablonu"
        />
        <label className="label" htmlFor="template-columns">
          <span className="label-text">Kolumny (oddzielone przecinkami)</span>
        </label>
        <textarea
          id="template-columns"
          className="textarea textarea-bordered w-full"
          placeholder="Kolumny oddzielone przecinkami (np. Firma,Email,Plan)"
          value={newTemplate.columns}
          onChange={(e) => setNewTemplate((prev) => ({ ...prev, columns: e.target.value }))}
          aria-label="Kolumny szablonu"
          rows={3}
        />
        <div className="flex items-center gap-2">
          <button className="btn btn-primary" onClick={saveTemplate} type="button" disabled={isSaving}>
            {isSaving ? 'Zapisywanie...' : '💾 Zapisz szablon'}
          </button>
          <button className="btn btn-ghost" onClick={exportTemplatesToCSV} type="button">
            ⬇️ Eksportuj listę szablonów (CSV)
          </button>
        </div>
      </div>

      <div className="divider">Dostępne szablony</div>

      <ul className="list-disc list-inside space-y-1">
        {templates.map((t) => {
          const cols = Array.isArray(t.columns) ? t.columns.join(', ') : t.columns;
          return (
            <li key={t._id || t.name} className="flex items-start justify-between gap-4">
              <div>
                <strong>{t.name}:</strong> {cols}
              </div>
              {t._id && (
                <button
                  type="button"
                  className="btn btn-xs btn-ghost text-error"
                  onClick={() => deleteTemplate(t._id)}
                  aria-label={`Usuń szablon ${t.name}`}
                  title="Usuń"
                >
                  Usuń
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
