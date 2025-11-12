import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { Dialog } from "@headlessui/react";
import toast from 'react-hot-toast';

export default function WalkthroughModal({ userId }) {
  const { theme } = useTheme();
  const { t } = useLiveText("walkthrough"); // ← destrukturyzacja + namespace
  const [step, setStep] = useState(1);
  const [shown, setShown] = useState(false);
  const localKey = `walkthrough_shown_${userId}`;

  useEffect(() => {
    const hasSeen = localStorage.getItem(localKey);
    if (!hasSeen) setShown(true);
  }, [localKey]);

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handleRestart = () => setStep(1);
  const handleClose = async () => {
    localStorage.setItem(localKey, "1");
    try {
      const res = await fetch("/api/telemetry/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, step: "finished" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (error) {
      toast.error(t('error') || 'Błąd zapisu telemetrii');
      console.error("Walkthrough telemetry error:", error);
    }
    setShown(false);
  };

  const steps = {
    1: { title: t("step1.title"), desc: t("step1.description") },
    2: { title: t("step2.title"), desc: t("step2.description") },
    3: { title: t("step3.title"), desc: t("step3.description") },
  };

  return (
    <Dialog open={shown} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className={clsx(
            theme?.panelBg || 'bg-white',
            theme?.textPrimary || 'text-gray-900',
            'rounded-xl shadow-lg max-w-md p-6 space-y-4'
          )}
        >
          <Dialog.Title className="text-xl font-semibold">{steps[step].title}</Dialog.Title>
          <Dialog.Description className="text-sm">{steps[step].desc}</Dialog.Description>

          <div className="flex justify-between pt-4">
            <button
              onClick={handleRestart}
              className={`${theme?.linkText || 'text-blue-500'} text-xs underline`}
            >
              {t("restart")}
            </button>
            {step < 3 ? (
              <button
                onClick={handleNext}
                className={`${theme?.buttonPrimaryBg || 'bg-blue-600'} ${theme?.buttonPrimaryText || 'text-white'} px-4 py-2 rounded`}
              >
                {t("common.next", "Dalej")}
              </button>
            ) : (
              <button
                onClick={handleClose}
                className={`${theme?.buttonSuccessBg || 'bg-green-600'} ${theme?.buttonPrimaryText || 'text-white'} px-4 py-2 rounded`}
              >
                {t("finish", "Zakończ")}
              </button>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

WalkthroughModal.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
