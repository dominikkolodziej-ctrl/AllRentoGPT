import PropTypes from 'prop-types';
import React, { useState } from 'react';

export default function SmartSearchInput({ onQueryParsed }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/search/nlp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        throw new Error(`Błąd zapytania: ${res.status}`);
      }

      const data = await res.json();
      onQueryParsed?.(data.filters || {});
    } catch (error) {
      console.error("Błąd podczas parsowania zapytania:", error);
      onQueryParsed?.({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="np. koparka w Krakowie na 2 dni"
        className="w-full border px-3 py-2 rounded"
      />
      <button
        onClick={handleParse}
        disabled={loading || !query}
        className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
      >
        {loading ? "Analiza..." : "Przekształć do filtrów"}
      </button>
    </div>
  );
}

// ✅ ESLint FIX: Uzupełnione PropTypes
SmartSearchInput.propTypes = {
  onQueryParsed: PropTypes.func.isRequired, // wymagane, bo komponent bez tego nie działa
};
