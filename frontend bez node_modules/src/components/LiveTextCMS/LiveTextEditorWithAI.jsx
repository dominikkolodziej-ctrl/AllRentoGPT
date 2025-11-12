import React, { useState } from 'react';
import PropTypes from 'prop-types';

// ✅ FAZA 3: AI Suggestion → POST /api/ai/generate

export default function LiveTextEditorWithAI({ label, value, onChange, lang, keyName, role }) {
  const [loading, setLoading] = useState(false);

  const handleGenerateAI = async () => {
    setLoading(true);
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Napisz treść CMS dla: ${keyName}`,
        lang,
        key: keyName,
        role
      }),
    });

    const data = await res.json();
    if (data.text) onChange(data.text);
    setLoading(false);
  };

  return (
    <div className="space-y-1">
      <label>{label}</label>
      <textarea
        className="w-full border rounded p-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button onClick={handleGenerateAI} disabled={loading} className="text-sm text-blue-500">
        {loading ? "Generowanie..." : "Wygeneruj AI"}
      </button>
    </div>
  );
}

LiveTextEditorWithAI.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  lang: PropTypes.string.isRequired,
  keyName: PropTypes.string.isRequired,
  role: PropTypes.string
};
