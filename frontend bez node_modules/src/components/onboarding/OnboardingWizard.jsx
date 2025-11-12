import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 9 – motywy

import Step1Plan from "@/components/onboarding/Step1Plan.jsx";
import Step2Company from "@/components/onboarding/Step2Company.jsx";
import Step3Branding from "@/components/onboarding/Step3Branding.jsx";
import Step4Preferences from "@/components/onboarding/Step4Preferences.jsx";
import Step5Summary from "@/components/onboarding/Step5Summary.jsx";

const steps = [
  { id: 1, component: Step1Plan },
  { id: 2, component: Step2Company },
  { id: 3, component: Step3Branding },
  { id: 4, component: Step4Preferences },
  { id: 5, component: Step5Summary },
];

export default function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const { theme } = useTheme(); // ✅ FAZA 9 – motywy
  const StepComponent = steps.find((s) => s.id === step)?.component;

  const next = () => setStep((s) => Math.min(s + 1, steps.length));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  if (!StepComponent) {
    return (
      <div className={`${theme?.textSecondary || 'text-gray-500'} italic`}>
        Brak kroku do wyświetlenia
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto p-4 ${theme?.panelBg || ''}`}>
      <StepComponent next={next} prev={prev} onComplete={onComplete} />
    </div>
  );
}

OnboardingWizard.propTypes = {
  onComplete: PropTypes.func,
};