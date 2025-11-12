import React from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';

export const LiveThemePreviewSandbox = () => {
  const { themeConfig, style } = useTheme();

  return (
    <div
      className="p-4 border mt-4"
      style={{ background: (themeConfig?.previewBg) || "#fff" }}
    >
      <h2 className={style("heading")}>Preview</h2>
      <p className={style("text")}>This is a live preview of your theme configuration.</p>
      <button className={style("button.primary")}>Example Button</button>
    </div>
  );
};

export default LiveThemePreviewSandbox;

// ✅ FAZA 9: ThemeContext – live preview z configu i styli
// 🔹 ESLint: usunięto nieużywane PropTypes
