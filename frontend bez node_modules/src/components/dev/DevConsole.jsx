import clsx from 'clsx';
import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';
import { mockInvoices } from "@/api/mockInvoices.js";
import { mockDocuments } from "@/api/mockDocuments.js";

const DevConsole = () => {
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("basic");
  const [showMocks, setShowMocks] = useState(false);
  const [simulateError, setSimulateError] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("mock-user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setPlan(parsed.plan || "basic");
    }
  }, []);

  const changePlan = (e) => {
    const newPlan = e.target.value;
    const updated = { ...user, plan: newPlan };
    localStorage.setItem("mock-user", JSON.stringify(updated));
    setPlan(newPlan);
    setUser(updated);
  };

  const clearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  const triggerError = () => {
    setSimulateError(true);
  };

  if (simulateError) throw new Error("Symulowany błąd dev");
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className={clsx("p-4 border rounded space-y-3", theme.background, theme.text)}>
      <h3 className="text-lg font-bold">🧪 Dev Console Pro Max</h3>

      <p><strong>User ID:</strong> {user?.id || "brak"}</p>
      <p><strong>Email:</strong> {user?.email || "brak"}</p>
      <p><strong>Plan:</strong> {plan}</p>

      <label className="block">
        <span className="text-sm">Zmień plan</span>
        <select value={plan} onChange={changePlan} className="mt-1 p-1 border rounded">
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </label>

      <button type="button" onClick={clearStorage} className="px-3 py-1 bg-red-600 text-white rounded text-sm">
        🧹 Reset danych lokalnych
      </button>

      <button type="button" onClick={() => setShowMocks(!showMocks)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
        {showMocks ? "Ukryj mocki" : "Pokaż mocki"}
      </button>

      <button type="button" onClick={triggerError} className="px-3 py-1 bg-yellow-600 text-black rounded text-sm">
        💥 Symuluj błąd
      </button>

      {showMocks && (
        <div className="text-xs bg-gray-100 text-black p-2 mt-2 rounded overflow-auto max-h-60">
          <pre>{JSON.stringify({ mockInvoices, mockDocuments }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DevConsole;
