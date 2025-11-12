import { useCallback, useEffect, useState } from 'react';
import config from '@/config/onboardingConfig.json';

const STORAGE_KEY = 'onboardingStep';

export const useOnboarding = () => {
  const readIndex = () => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const n = saved ? parseInt(saved, 10) : 0;
      return Number.isFinite(n) && n >= 0 ? Math.min(n, config.length) : 0;
    } catch (e) {
      void e;
      return 0;
    }
  };

  const [stepIndex, setStepIndex] = useState(readIndex);

  const completed = stepIndex >= config.length;
  const step = !completed ? config[stepIndex] : null;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(stepIndex));
    } catch (e) {
      void e;
    }
  }, [stepIndex]);

  const next = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, config.length));
  }, []);

  return { step, stepIndex, completed, next };
};

export default useOnboarding;
