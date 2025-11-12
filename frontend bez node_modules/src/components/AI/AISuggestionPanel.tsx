// Ścieżka: src/components/AI/AISuggestionPanel.tsx
import React from 'react';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1: tłumaczenia UI
import { useAISuggestion } from '@/hooks/useAISuggestion';

// ✅ FAZA 1: tłumaczenia
// ✅ FAZA 3: AI Suggestion (fetchSuggestions, useAISuggestion)

export interface AISuggestionPanelProps {
  initialText: string;
  onApply: (text: string) => void;
}

const AISuggestionPanel = ({ initialText, onApply }: AISuggestionPanelProps) => {
  const { suggestions, fetchSuggestions, loading } = useAISuggestion();
  const { t } = useLiveText();

  return (
    <div className="p-4 rounded border bg-gray-50">
      <button
        onClick={() => fetchSuggestions(initialText)}
        className="bg-indigo-600 text-white px-4 py-2 rounded text-sm"
        disabled={loading}
      >
        {loading ? t("ai.loading") : t("ai.suggest")}
      </button>

      {suggestions.length > 0 && (
        <ul className="mt-3 text-sm space-y-1">
          {suggestions.map((sug, idx) => (
            <li key={idx} className="bg-white border px-3 py-1 rounded flex justify-between items-center">
              <span>{sug}</span>
              <button
                onClick={() => onApply(sug)}
                className="text-xs text-blue-600 hover:underline"
              >
                {t("ai.use")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AISuggestionPanel;
