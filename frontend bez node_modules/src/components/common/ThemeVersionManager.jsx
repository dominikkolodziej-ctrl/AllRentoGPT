import React from 'react';
import { useLiveTheme } from '@/hooks/useLiveTheme.js';

const ThemeVersionManager = () => {
  const { theme, setTheme } = useLiveTheme();

  return (
    <div className="mb-4 flex items-center gap-2">
      <label htmlFor="theme-select">🎨 Motyw:</label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="border rounded p-1"
      >
        <option value="classic">Classic</option>
        <option value="dark">Dark</option>
        <option value="pro">Pro</option>
      </select>
    </div>
  );
};

export default ThemeVersionManager;
