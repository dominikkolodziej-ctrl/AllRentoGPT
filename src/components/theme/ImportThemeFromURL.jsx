import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';

export const ImportThemeFromURL = () => {
  const [url, setUrl] = useState("");
  const { setThemeConfig } = useTheme();

  const fetchTheme = async () => {
    try {
      const res = await fetch(url);
      const config = await res.json();
      setThemeConfig(config);
    } catch {
      alert("Import failed.");
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="url"
        className="border px-2 py-1 flex-1"
        placeholder="https://...theme.json"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        aria-label="Theme JSON URL"
      />
      <button className="btn" onClick={fetchTheme}>Import</button>
    </div>
  );
};

export default ImportThemeFromURL;

// ✅ FAZA 9 – motywy (useTheme + setThemeConfig)
// ✅ FAZA 8 – fetch z zewnętrznego URL
// ✅ FAZA 10 – podstawowa obsługa błędów (alert)
// 🔹 ESLint FIX – przywrócono `import React` dla JSX, usunięto nieużywane `e` z catch
