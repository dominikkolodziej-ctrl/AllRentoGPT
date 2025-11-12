// src/pages/admin/StagingControl.jsx
import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

function toInputDateTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  } catch {
    return '';
  }
}

function toISOFromInput(localVal) {
  if (!localVal) return '';
  try {
    const d = new Date(localVal);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString();
  } catch {
    return '';
  }
}

export default function StagingControl() {
  const [config, setConfig] = useState({
    maintenance: false,
    environment: 'production',
    currentVersion: '1.0.0',
    nextVersion: '',
    rolloutDate: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const loadConfig = useCallback(async (signal) => {
    setLoading(true);
    const data = await apiFetch('/api/admin/system-config', { signal });
    if (data) {
      setConfig({
        maintenance: Boolean(data.maintenance),
        environment: data.environment === 'staging' ? 'staging' : 'production',
        currentVersion: (data.currentVersion ?? '1.0.0').toString(),
        nextVersion: (data.nextVersion ?? '').toString(),
        rolloutDate: toInputDateTime(data.rolloutDate ?? ''),
      });
    }
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => {
    const ac = new AbortController();
    loadConfig(ac.signal);
    return () => ac.abort();
  }, [loadConfig]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const updateConfig = async () => {
    const payload = {
      maintenance: Boolean(config.maintenance),
      environment: config.environment === 'staging' ? 'staging' : 'production',
      currentVersion: (config.currentVersion || '').trim(),
      nextVersion: (config.nextVersion || '').trim(),
      rolloutDate: toISOFromInput(config.rolloutDate),
    };
    setSaving(true);
    const ok = await apiFetch('/api/admin/system-config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (ok !== null) {
      toast.success('Zapisano konfigurację systemu');
      try {
        window.dispatchEvent(new CustomEvent('app:system-config-updated', { detail: payload }));
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">🧪 Zarządzanie środowiskiem systemu</h2>

      {loading ? (
        <p>Ładowanie...</p>
      ) : (
        <>
          <label className="label cursor-pointer" htmlFor="maintenance-toggle">
            <span className="label-text">Tryb konserwacji (maintenance)</span>
            <input
              id="maintenance-toggle"
              type="checkbox"
              name="maintenance"
              className="toggle"
              checked={config.maintenance}
              onChange={handleChange}
              aria-checked={config.maintenance}
            />
          </label>

          <div className="form-control">
            <label className="label" htmlFor="environment-select">
              <span className="label-text">Środowisko</span>
            </label>
            <select
              id="environment-select"
              className="select select-bordered"
              name="environment"
              value={config.environment}
              onChange={handleChange}
              aria-label="Wybierz środowisko"
            >
              <option value="production">Production</option>
              <option value="staging">Staging</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="currentVersion">
                <span className="label-text">Obecna wersja</span>
              </label>
              <input
                id="currentVersion"
                name="currentVersion"
                className="input input-bordered w-full"
                value={config.currentVersion}
                onChange={handleChange}
                aria-label="Obecna wersja"
              />
            </div>
            <div>
              <label className="label" htmlFor="nextVersion">
                <span className="label-text">Następna wersja</span>
              </label>
              <input
                id="nextVersion"
                name="nextVersion"
                className="input input-bordered w-full"
                value={config.nextVersion}
                onChange={handleChange}
                aria-label="Następna wersja"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label" htmlFor="rolloutDate">
                <span className="label-text">Data wdrożenia (next version)</span>
              </label>
              <input
                id="rolloutDate"
                type="datetime-local"
                name="rolloutDate"
                className="input input-bordered w-full"
                value={config.rolloutDate}
                onChange={handleChange}
                aria-label="Data wdrożenia"
              />
            </div>
          </div>

          <div>
            <button
              className="btn btn-primary"
              onClick={updateConfig}
              type="button"
              disabled={saving}
              aria-disabled={saving}
            >
              {saving ? 'Zapisywanie…' : 'Zapisz ustawienia'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
