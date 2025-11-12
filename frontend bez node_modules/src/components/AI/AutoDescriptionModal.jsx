import PropTypes from 'prop-types';
import React, { useState } from "react";

// ✅ FAZA 3: AI opis oferty przez POST /api/ai/generate-description

export default function AutoDescriptionModal({ onGenerate }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    const res = await fetch("/api/ai/generate-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setResult(data.description);
    setLoading(false);
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h3 className="text-lg font-medium mb-2">Wygeneruj opis oferty (AI)</h3>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full border rounded p-2 mb-2"
        rows={4}
        placeholder="Podaj kilka informacji o ofercie..."
      />
      <button
        onClick={handleGenerate}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Generowanie..." : "Generuj"}
      </button>
      {result && (
        <div className="mt-4 border-t pt-2 text-sm text-gray-700">
          <strong>Wynik:</strong> {result}
          <div className="mt-2">
            <button
              onClick={() => onGenerate(result)}
              className="text-blue-500 underline text-xs"
            >
              Wstaw do opisu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

AutoDescriptionModal.propTypes = {
  onGenerate: PropTypes.func.isRequired,
};
