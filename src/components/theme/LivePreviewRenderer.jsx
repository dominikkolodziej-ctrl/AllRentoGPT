import React from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';

export default function LivePreviewRenderer() {
  const { theme } = useTheme(); // ✅ użycie theme z kontekstu

  return (
    <div
      className="p-4 border rounded"
      style={{
        backgroundColor: theme?.colors?.background,
        color: theme?.colors?.text
      }}
    >
      <h4 style={{ color: theme?.colors?.primary }}>Podgląd motywu</h4>
      <p>To jest poglądowy widok Twojej aplikacji.</p>
    </div>
  );
}

// ✅ FAZA 9 – motywy (useTheme + dynamiczne kolory)
// 🔹 ESLint FIX – usunięto unused var przez faktyczne użycie `useTheme`
