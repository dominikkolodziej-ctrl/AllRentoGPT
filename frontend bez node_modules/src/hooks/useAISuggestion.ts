// Ścieżka: src/hooks/useAISuggestion.ts
import { useState, useEffect, useRef, useCallback } from 'react';

type Suggestion = string;

type UseAISuggestionReturn = {
  suggestions: Suggestion[];
  loading: boolean;
  fetchSuggestions: (text: string) => Promise<void>;
  cancel: () => void;
};

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

const isSuggestionEnvelope = (v: unknown): v is { suggestions: string[] } =>
  typeof v === 'object' &&
  v !== null &&
  'suggestions' in v &&
  isStringArray((v as { suggestions?: unknown }).suggestions);

export const useAISuggestion = (): UseAISuggestionReturn => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setLoading(false);
  }, []);

  const fetchSuggestions = useCallback(async (text: string) => {
    cancel();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: unknown = await res.json();

      let list: Suggestion[] = [];
      if (isStringArray(data)) {
        list = data;
      } else if (isSuggestionEnvelope(data)) {
        list = data.suggestions;
      }

      setSuggestions(list);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      // eslint-disable-next-line no-console
      console.error('AI Suggestion error:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  }, [cancel]);

  useEffect(() => cancel, [cancel]);

  return { suggestions, fetchSuggestions, loading, cancel };
};
