import PropTypes from 'prop-types';
import React from 'react';
import { useState } from "react";

export default function BusinessProfileSetup({ onComplete }) {
  const [form, setForm] = useState({
    industry: "",
    typicalNeeds: [],
    area: "",
  });

  const handleSubmit = async () => {
    await fetch("/api/user/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    onComplete();
  };

  return (
    <div className="space-y-3 p-4 bg-white border rounded shadow-sm">
      <h2 className="text-lg font-semibold">Dopasujmy oferty do Twojej firmy</h2>

      <div>
        <label htmlFor="industry" className="block text-sm font-medium">Branża</label>
        <select
          id="industry"
          value={form.industry}
          onChange={(e) => setForm({ ...form, industry: e.target.value })}
          className="w-full border px-2 py-1 rounded"
        >
          <option value="">Wybierz...</option>
          <option value="budownictwo">Budownictwo</option>
          <option value="transport">Transport</option>
          <option value="eventy">Eventy</option>
        </select>
      </div>

      <div>
        <label htmlFor="typicalNeeds" className="block text-sm font-medium">Typowe potrzeby</label>
        <div id="typicalNeeds" className="flex flex-wrap gap-2 text-sm">
          {["koparka", "generator", "hala", "laweta"].map((need) => (
            <label key={need} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={form.typicalNeeds.includes(need)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setForm({
                    ...form,
                    typicalNeeds: checked
                      ? [...form.typicalNeeds, need]
                      : form.typicalNeeds.filter((n) => n !== need),
                  });
                }}
              />
              {need}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="area" className="block text-sm font-medium">Lokalizacja działania</label>
        <input
          id="area"
          type="text"
          value={form.area}
          onChange={(e) => setForm({ ...form, area: e.target.value })}
          className="w-full border px-2 py-1 rounded"
          placeholder="np. Kraków, Śląsk..."
        />
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
      >
        Zapisz i kontynuuj
      </button>
    </div>
  );
}

BusinessProfileSetup.propTypes = {
  onComplete: PropTypes.func.isRequired,
};
