import React from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';

export default function SectionReorderPanel() {
  const { theme, setTheme } = useTheme();

  const newOrder = theme?.layout?.home?.order || []; // ✅ zabezpieczenie przed undefined

  const updateOrder = () => {
    const updated = { ...theme, layout: { ...theme.layout, home: { ...theme.layout.home, order: newOrder } } };
    setTheme(updated);
  };

  return (
    <div>
      <h3 className="font-semibold mb-2">Kolejność sekcji</h3>
      <p className="text-sm text-gray-600">Aktualna kolejność:</p>
      <ul className="list-decimal ml-5 space-y-1 text-sm">
        {newOrder.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <p className="text-xs text-gray-500 mt-2">* Drag & drop UI można dodać na życzenie</p>
      <button
        type="button"
        onClick={updateOrder}
        className="mt-3 text-sm text-blue-500 underline"
      >
        Zapisz kolejność
      </button>
    </div>
  );
}

// ✅ FAZA 9 – motywy (useTheme, setTheme, dynamiczny layout.home.order)
// 🔹 ESLint: dodano zabezpieczenia optional chaining, type="button" w <button>
