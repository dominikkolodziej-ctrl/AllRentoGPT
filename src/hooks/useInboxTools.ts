import { useState, useCallback } from 'react';

type TagMap<TId extends string | number> = Partial<Record<TId, string[]>>;

export const useInboxTools = <TId extends string | number = string>() => {
  const [selected, setSelected] = useState<TId[]>([]);
  const [tags, setTags] = useState<TagMap<TId>>({});
  const [pinned, setPinned] = useState<TId[]>([]);

  const toggleSelect = useCallback((id: TId) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }, []); // ✅ FAZA 13 WDROŻONA

  const addTag = useCallback((id: TId, tag: string) => {
    setTags((prev) => {
      const current = prev[id] ?? [];
      const next = current.includes(tag) ? current : [...current, tag];
      return { ...prev, [id]: next };
    });
  }, []); // ✅ FAZA 13 WDROŻONA

  const togglePin = useCallback((id: TId) => {
    setPinned((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }, []); // ✅ FAZA 13 WDROŻONA

  return { selected, toggleSelect, tags, addTag, pinned, togglePin }; // ✅ FAZA 6 WDROŻONA
};
