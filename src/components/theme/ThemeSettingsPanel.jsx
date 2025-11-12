import React from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';
import PresetSelector from "@/components/theme/PresetSelector.jsx";

export const ThemeSettingsPanel = () => {
  const { themeConfig, setThemeConfig } = useTheme();

  const handleChange = (key, value) => {
    setThemeConfig({ ...(themeConfig || {}), [key]: value });
  };

  const entries = Object.entries(themeConfig || {});

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Theme Settings</h2>
      <PresetSelector />
      <div className="flex flex-col gap-2">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <label className="w-32" htmlFor={`theme-${key}`}>{key}</label>
            <input
              id={`theme-${key}`}
              type="text"
              className="border p-1 flex-1"
              value={value ?? ""}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeSettingsPanel;
