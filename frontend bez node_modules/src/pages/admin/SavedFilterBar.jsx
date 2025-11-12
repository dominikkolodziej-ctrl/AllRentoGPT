import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

export default function SavedFilterBar({ onApply }) {
  const [filters, setFilters] = useState([]);
  const [newName, setNewName] = useState('');

  const load = useCallback(async (signal) => {
    try {
      const res = await fetch('/api/admin/filters', { signal });
      if (!res.ok) throw new Error('Błąd ładowania filtrów');
      const data = await res.json();
      setFilters(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || 'Błąd ładowania filtrów');
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  const save = useCallback(async () => {
    try {
      const current = onApply('export');
      if (!current) {
        toast.error('Brak aktywnego filtra do zapisania');
        return;
      }
      const name = newName.trim();
      if (!name) {
        toast.error('Podaj nazwę widoku');
        return;
      }
      const res = await fetch('/api/admin/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, config: current }),
      });
      if (!res.ok) throw new Error('Błąd zapisu');
      setNewName('');
      toast.success('Zapisano filtr');
      await load();
    } catch (err) {
      toast.error(err.message || 'Błąd zapisu filtra');
    }
  }, [newName, onApply, load]);

  return (
    <div className="space-y-2">
      <h3 className="font-bold">🔍 Zapisane widoki</h3>
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f._id}
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => onApply(f.config)}
            aria-label={`Zastosuj widok ${f.name}`}
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <input
          className="input input-bordered"
          placeholder="Nazwa widoku"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          aria-label="Nazwa zapisywanego widoku"
        />
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={save}
          disabled={!newName.trim()}
          aria-disabled={!newName.trim()}
        >
          💾 Zapisz aktualny filtr
        </button>
      </div>
    </div>
  );
}

SavedFilterBar.propTypes = {
  onApply: PropTypes.func.isRequired,
};
