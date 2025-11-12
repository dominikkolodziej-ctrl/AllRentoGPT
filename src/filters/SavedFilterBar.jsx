// 📍 src/components/filters/SavedFilterBar.jsx (v2 ENTERPRISE)
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function SavedFilterBar({ onApply }) {
  const { t } = useLiveText();
  const [filters, setFilters] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/filters/saved', { signal: controller.signal });
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setFilters(list);
      } catch {
        setFilters([]);
      }
    })();
    return () => controller.abort();
  }, []);

  const handleApply = () => {
    const filter = filters.find((f) => String(f.id) === selected);
    if (filter && filter.query) onApply(filter.query);
  };

  return (
    <div className="flex items-center gap-2" role="group" aria-label={t('filters.saved.bar') || 'Zapisane filtry'}>
      <Select value={selected} onValueChange={setSelected}>
        <SelectTrigger className="w-64" aria-label={t('filters.saved.select') || 'Wybierz zapisany filtr'}>
          <SelectValue placeholder={t('filters.saved.placeholder') || 'Zapisane filtry'} />
        </SelectTrigger>
        <SelectContent>
          {filters.map((f) => (
            <SelectItem key={f.id} value={String(f.id)}>
              {f.name || t('filters.unnamed') || 'Bez nazwy'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleApply} disabled={!selected} aria-disabled={!selected}>
        {t('filters.apply') || 'Zastosuj'}
      </Button>
    </div>
  );
}

SavedFilterBar.propTypes = {
  onApply: PropTypes.func.isRequired,
};
