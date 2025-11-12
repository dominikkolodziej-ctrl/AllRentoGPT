// 📍 src/components/onboarding/Coachmark.jsx (v2 ENTERPRISE)
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent } from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';
import toast from 'react-hot-toast';

const steps = [
  { titleKey: 'walkthrough.step1.title', contentKey: 'walkthrough.step1.content' },
  { titleKey: 'walkthrough.step2.title', contentKey: 'walkthrough.step2.content' },
  { titleKey: 'walkthrough.step3.title', contentKey: 'walkthrough.step3.content' },
];

export default function WalkthroughModal({ userId, onEvent, className = '' }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const { t } = useLiveText();
  const { theme } = useTheme();

  useEffect(() => {
    const seen = localStorage.getItem(`walkthrough_shown_${userId}`);
    if (!seen) setOpen(true);
  }, [userId]);

  const sendWalkthroughTelemetry = useCallback(
    async (completed) => {
      try {
        const res = await fetch('/api/telemetry/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, completed, step, timestamp: Date.now() }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        onEvent?.('walkthrough_telemetry_sent', { completed, step });
      } catch {
        toast.error(t('walkthrough.telemetryError') || 'Błąd telemetryki');
      }
    },
    [userId, step, onEvent, t]
  );

  const handleNext = useCallback(async () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      onEvent?.('walkthrough_next', { step: step + 1 });
    } else {
      localStorage.setItem(`walkthrough_shown_${userId}`, '1');
      setOpen(false);
      onEvent?.('walkthrough_finished');
      await sendWalkthroughTelemetry(true);
    }
  }, [step, userId, sendWalkthroughTelemetry, onEvent]);

  const restart = useCallback(() => {
    setStep(0);
    setOpen(true);
    localStorage.removeItem(`walkthrough_shown_${userId}`);
    onEvent?.('walkthrough_restarted');
  }, [userId, onEvent]);

  const labels = useMemo(
    () => ({
      restart: t('walkthrough.restart') || 'Restart',
      next: t('walkthrough.next') || 'Dalej',
      finish: t('walkthrough.finish') || 'Zakończ',
    }),
    [t]
  );

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogContent
        className={`${theme?.panelBg || 'bg-white'} ${theme?.textPrimary || ''} ${className}`}
        aria-labelledby="walkthrough-title"
        aria-describedby="walkthrough-content"
      >
        <h2 id="walkthrough-title" className="text-xl font-bold mb-2">
          {t(steps[step].titleKey)}
        </h2>
        <p id="walkthrough-content" className="mb-4 text-sm text-muted-foreground">
          {t(steps[step].contentKey)}
        </p>
        <div className="flex justify-between">
          <Button variant="ghost" onClick={restart} className={theme?.buttonGhost || ''}>
            {labels.restart}
          </Button>
          <Button onClick={handleNext} className={theme?.buttonPrimaryBg || ''}>
            {step < steps.length - 1 ? labels.next : labels.finish}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

WalkthroughModal.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onEvent: PropTypes.func,
  className: PropTypes.string,
};
