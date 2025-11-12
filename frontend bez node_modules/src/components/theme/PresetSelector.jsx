import React from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';

const presets = {
  light: {
    background: "bg-white",
    text: "text-black",
  },
  dark: {
    background: "bg-gray-900",
    text: "text-white",
  },
  blue: {
    background: "bg-blue-50",
    text: "text-blue-900",
  },
};

export const PresetSelector = () => {
  const { setThemeConfig, themeConfig } = useTheme();

  const applyPreset = (presetKey) => {
    const preset = presets[presetKey];
    if (!preset) return;
    setThemeConfig({ ...(themeConfig || {}), ...preset });
  };

  return (
    <div className="flex gap-2">
      {Object.keys(presets).map((key) => (
        <button
          key={key}
          type="button"
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={() => applyPreset(key)}
        >
          {key}
        </button>
      ))}
    </div>
  );
};

export default PresetSelector;
