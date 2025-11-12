// Ścieżka: src/components/Onboarding/HintTrigger.tsx
import React, { ReactNode } from 'react';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1 – tłumaczenia
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 9 – motywy

type HintTriggerProps = {
  children: ReactNode;
  onHover: () => void;
};

const HintTrigger = ({ children, onHover }: HintTriggerProps) => {
  const { t } = useLiveText(); // ✅ FAZA 1 – tłumaczenia
  const { theme } = useTheme(); // ✅ FAZA 9 – motywy

  return (
    <div onMouseEnter={onHover} className="relative group cursor-pointer">
      {children}
      <div
        className={`absolute hidden group-hover:block text-xs rounded px-2 py-1 mt-1 z-10
          ${theme?.tooltipBg || 'bg-black'} ${theme?.tooltipText || 'text-white'}`}
      >
        {t("onboarding.hint") || 'Podpowiedź'}
      </div>
    </div>
  );
};

export default HintTrigger;