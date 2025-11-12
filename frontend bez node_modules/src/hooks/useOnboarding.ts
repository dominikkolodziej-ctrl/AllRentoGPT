import { useCallback, useEffect, useState } from 'react';
import config from '@/config/onboardingConfig.json';

const STORAGE_KEY = 'onboardingStep';

export const useOnboarding = () => {
  const total = Array.isArray(config) ? config.length : 0; // ✅ FAZA 11 WDROŻONA

  const readIndex = () => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const n = saved ? parseInt(saved, 10) : 0;
      return Number.isFinite(n) && n >= 0 ? Math.min(n, total) : 0;
    } catch {
      return 0;
    }
  };

  const [step, setStep] = useState<number>(readIndex());
  const completed = step >= total;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(step));
    } catch {
      // ignore
    }
  }, [step]);

  const next = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, total));
  }, [total]);

  const reset = useCallback(() => {
    setStep(0);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, []);

  return { step, next, reset, completed };
};
