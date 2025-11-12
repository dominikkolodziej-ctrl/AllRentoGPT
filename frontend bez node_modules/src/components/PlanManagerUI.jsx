import React, { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';

const defaultPlans = [
  { id: 'basic', name: 'Basic', price: '0 PLN', features: ['1 użytkownik', 'E-mail wsparcie'] },
  { id: 'pro', name: 'Pro', price: '99 PLN', features: ['5 użytkowników', 'Support', 'Statystyki'] },
  { id: 'enterprise', name: 'Enterprise', price: '299 PLN', features: ['Nieograniczeni użytkownicy', 'Konto dedykowane', 'Priorytetowy support'] },
];

const PlanManagerUI = ({ plans = defaultPlans, currentPlan, onSelect, onEvent, className = '' }) => {
  const { theme } = useTheme();
  const { t } = useLiveText();

  const normalized = useMemo(
    () =>
      plans.map((p) => ({
        id: String(p.id),
        name: String(p.name),
        price: String(p.price),
        features: Array.isArray(p.features) ? p.features.map(String) : [],
      })),
    [plans]
  );

  const handleSelect = useCallback(
    (plan) => {
      onSelect?.(plan.id);
      onEvent?.('plan_select_clicked', { planId: plan.id });
    },
    [onSelect, onEvent]
  );

  const containerCls = clsx('space-y-6', theme?.background, theme?.text, className);
  const cardCls = (selected) =>
    clsx(
      'p-4 border transition-shadow',
      theme?.border ?? 'border-gray-200',
      theme?.radius ?? 'rounded-lg',
      selected ? theme?.selectedCard ?? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow'
    );
  const buttonCls = (disabled) =>
    clsx(
      'mt-4 w-full py-2',
      theme?.radius ?? 'rounded',
      disabled
        ? theme?.buttonDisabled ?? 'bg-gray-200 text-gray-500 cursor-not-allowed'
        : theme?.primary ?? 'bg-blue-600 text-white hover:bg-blue-700'
    );

  return (
    <div className={containerCls} role="region" aria-label={t('plans.manager.label') || 'Wybór planu'}>
      <h2 className="text-xl font-bold mb-2">{t('plans.choose') || 'Wybierz plan'}</h2>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {normalized.map((plan) => {
          const selected = currentPlan && String(currentPlan) === plan.id;
          return (
            <div key={plan.id} className={cardCls(selected)} aria-current={selected ? 'true' : undefined}>
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-xl font-bold">{plan.price}</p>
              <ul className="text-sm mt-2 space-y-1">
                {plan.features.map((f) => (
                  <li key={`${plan.id}-${f}`}>• {f}</li>
                ))}
              </ul>
              <button
                type="button"
                className={buttonCls(selected)}
                onClick={() => handleSelect(plan)}
                disabled={selected}
                aria-pressed={selected ? 'true' : 'false'}
                aria-label={
                  selected
                    ? (t('plans.current') || 'Obecny plan')
                    : `${t('plans.select') || 'Wybierz plan'}: ${plan.name}`
                }
              >
                {selected ? t('plans.current') || 'Obecny plan' : t('plans.select') || 'Wybierz'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

PlanManagerUI.propTypes = {
  plans: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.string.isRequired,
      features: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ),
  currentPlan: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelect: PropTypes.func,
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export default memo(PlanManagerUI);
