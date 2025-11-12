// src/components/theme/ThemeEditorPanel.jsx
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useTheme } from '@/context/ThemeContext.jsx';

const presets = {
  light: {
    background: 'bg-white',
    text: 'text-gray-900',
    primary: 'text-blue-600',
    border: 'border-gray-300',
    shadow: 'shadow-sm',
    radius: 'rounded-md',
  },
  dark: {
    background: 'bg-gray-900',
    text: 'text-white',
    primary: 'text-teal-400',
    border: 'border-gray-700',
    shadow: 'shadow-lg',
    radius: 'rounded-lg',
  },
  ocean: {
    background: 'bg-blue-50',
    text: 'text-blue-900',
    primary: 'text-cyan-600',
    border: 'border-blue-200',
    shadow: 'shadow-md',
    radius: 'rounded-xl',
  },
};

export default function ThemeEditorPanel() {
  const { theme, setTheme } = useTheme();
  const [selected, setSelected] = useState('light');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') setTheme((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // silent
    }
  }, [setTheme]);

  const applyPreset = (key) => {
    const preset = presets[key];
    if (!preset) return;
    setTheme((prev) => ({ ...prev, ...preset }));
    setSelected(key);
    try {
      localStorage.setItem('theme', JSON.stringify({ ...theme, ...preset }));
    } catch {
      // silent
    }
  };

  return (
    <div className={clsx('p-4 space-y-4', theme?.background || 'bg-white', theme?.text || 'text-gray-900')}>
      <h2 className="text-lg font-semibold">Wybierz motyw</h2>
      <div className="flex gap-4">
        {Object.keys(presets).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => applyPreset(key)}
            className={clsx(
              'px-4 py-2 border',
              theme?.border || 'border-gray-300',
              theme?.radius || 'rounded-md',
              selected === key && 'bg-gray-200'
            )}
            aria-pressed={selected === key}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}

// TODO [FAZA 12: po zmianie presetów rozważyć publikację zdarzenia do LivePreviewRenderer]
