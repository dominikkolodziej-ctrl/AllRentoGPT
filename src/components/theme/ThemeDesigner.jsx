// src/components/theme/ThemeDesigner.jsx
import React from 'react';
import ThemePropEditor from '@/components/theme/ThemePropEditor.jsx';
import SectionReorderPanel from '@/components/theme/SectionReorderPanel.jsx';

export default function ThemeDesigner() {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-bold">Edytor motywu</h2>
      <ThemePropEditor />
      <SectionReorderPanel />
    </div>
  );
}

// TODO [FAZA 12: dodać podgląd na żywo + zapis wersji motywu po zmianach]
