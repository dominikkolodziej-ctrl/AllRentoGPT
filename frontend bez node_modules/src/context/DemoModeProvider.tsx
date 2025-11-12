import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

type DemoModeContextType = {
  demoMode: boolean;
  setDemoMode: React.Dispatch<React.SetStateAction<boolean>>;
};

type DemoModeProviderProps = {
  children: ReactNode;
};

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const DemoModeProvider = ({ children }: DemoModeProviderProps) => {
  const [demoMode, setDemoMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('demoMode') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('demoMode', demoMode ? '1' : '0');
      // TODO [FAZA 9: emit analytics event 'demo_mode_toggle']
    } catch {
      // ignore
    }
  }, [demoMode]);

  const value = useMemo(() => ({ demoMode, setDemoMode }), [demoMode]); // ✅ FAZA 13

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
};

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (!context) throw new Error('useDemoMode must be used within a DemoModeProvider');
  return context;
};

// TODO [FAZA 1: użyć t('demoMode.banner') w komponencie UI jeśli pokażemy banner]
// TODO [FAZA 12: warianty motywu dla trybu demo (np. ramka/znacznik w UI)]
