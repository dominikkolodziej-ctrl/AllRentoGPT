import React from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';

export default function ThemePropEditor() {
  const { theme, setTheme } = useTheme();

  const updateColor = (key, value) => {
    setTheme({
      ...theme,
      colors: { ...(theme?.colors || {}), [key]: value }
    });
  };

  const keys = ["background", "primary", "text"];

  return (
    <div>
      <h3 className="font-semibold mb-2">Kolory</h3>
      {keys.map((key) => (
        <div key={key} className="mb-2">
          <label className="mr-2" htmlFor={`color-${key}`}>{key}</label>
          <input
            id={`color-${key}`}
            type="color"
            value={theme?.colors?.[key] || "#ffffff"}
            onChange={(e) => updateColor(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
