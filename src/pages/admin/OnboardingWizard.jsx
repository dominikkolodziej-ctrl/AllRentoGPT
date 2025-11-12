import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';

const steps = [
  'Witaj na platformie AllRento!',
  'Dodaj pierwszą ofertę',
  'Skonfiguruj swój plan i motyw',
  'Gotowe – działaj!',
];

const OnboardingWizard = () => {
  const theme = useTheme();
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    try {
      const savedComplete = localStorage.getItem('onboarding:complete') === 'true';
      const savedStep = Number(localStorage.getItem('onboarding:step') || 0);
      setCompleted(savedComplete);
      if (!savedComplete && !Number.isNaN(savedStep)) setStep(Math.min(savedStep, steps.length - 1));
    } catch {
      /* storage not available */
    }
  }, []);

  useEffect(() => {
    try {
      if (!completed) localStorage.setItem('onboarding:step', String(step));
    } catch {
      /* ignore */
    }
  }, [step, completed]);

  const nextStep = () => {
    setStep((s) => (s < steps.length - 1 ? s + 1 : s));
  };

  const completeOnboarding = async () => {
    setCompleted(true);
    try {
      localStorage.setItem('onboarding:complete', 'true');
      localStorage.removeItem('onboarding:step');
    } catch {
      /* ignore */
    }
    try {
      await fetch('/api/onboarding/complete', { method: 'POST' });
    } catch {
      /* backend optional */
    }
    try {
      window.dispatchEvent(new CustomEvent('app:onboarding-complete'));
    } catch {
      /* ignore */
    }
  };

  const skip = () => {
    completeOnboarding();
  };

  return (
    <div className={clsx('p-6 text-center space-y-4', theme.background, theme.text)}>
      <h2 className="text-2xl font-bold">Onboarding</h2>

      {completed ? (
        <p className="text-green-700 font-semibold">🎉 Gratulacje, jesteś gotowy!</p>
      ) : (
        <>
          <p aria-live="polite">{steps[step]}</p>

          <div className="flex items-center justify-center gap-2">
            {step < steps.length - 1 ? (
              <>
                <button
                  type="button"
                  onClick={nextStep}
                  className={clsx('mt-4 px-4 py-2 btn', theme.primary)}
                  aria-label="Przejdź do następnego kroku"
                >
                  Dalej
                </button>
                <button
                  type="button"
                  onClick={skip}
                  className="mt-4 px-4 py-2 btn btn-ghost"
                  aria-label="Pomiń onboarding"
                >
                  Pomiń
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={completeOnboarding}
                className={clsx('mt-4 px-4 py-2 btn', theme.primary)}
                aria-label="Zakończ onboarding"
              >
                Zakończ
              </button>
            )}
          </div>

          <div className="pt-2 text-sm opacity-80">
            Krok {step + 1} / {steps.length}
          </div>
        </>
      )}
    </div>
  );
};

export default OnboardingWizard;
