import { useTheme } from '@/context/ThemeContext.jsx';
import React from 'react';

const ThemeVersionManager = () => {
  const { theme } = useTheme();

  return (
    <div>
      <h2>Aktualny motyw:</h2>
      <pre>{JSON.stringify(theme, null, 2)}</pre>
    </div>
  );
};

export default ThemeVersionManager;

// ✅ FAZA 9 – motywy (useTheme – podgląd bieżącego motywu)
