import React, { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const defaultPlans = ['Free', 'Pro', 'Enterprise'];

const PlanSelector = ({ setActivePlan, activePlan, plans = defaultPlans, onEvent, className = '' }) => {
  const { t } = useLiveText();
  const { theme } = useTheme();

  const items = useMemo(() => plans.map((p) => String(p)), [plans]);
  const selectedIndex = useMemo(
    () => Math.max(0, items.findIndex((p) => p === activePlan)),
    [items, activePlan]
  );

  const onSelect = useCallback(
    (plan) => {
      setActivePlan?.(plan);
      onEvent?.('plan_selected', { plan });
    },
    [setActivePlan, onEvent]
  );

  const onKey = useCallback(
    (e) => {
      if (!items.length) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (selectedIndex + 1) % items.length;
        onSelect(items[next]);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (selectedIndex - 1 + items.length) % items.length;
        onSelect(items[prev]);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (selectedIndex >= 0) onSelect(items[selectedIndex]);
      }
    },
    [items, selectedIndex, onSelect]
  );

  const headingCls = theme?.heading2 ?? 'text-xl font-semibold mb-2';
  const groupCls = `flex space-x-4 ${className}`;
  const btnBase = theme?.planButton ?? 'px-4 py-2 border rounded hover:bg-gray-100';
  const btnActive = theme?.planButtonActive ?? 'bg-blue-600 text-white hover:bg-blue-700';

  return (
    <div>
      <h2 className={headingCls}>{t('plans.choose') || 'Wybierz plan'}</h2>
      <div
        className={groupCls}
        role="radiogroup"
        aria-label={t('plans.selector') || 'Wybór planu'}
        onKeyDown={onKey}
        tabIndex={0}
      >
        {items.map((plan) => {
          const active = plan === activePlan;
          return (
            <button
              key={plan}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={plan}
              className={`${btnBase} ${active ? btnActive : ''}`}
              onClick={() => onSelect(plan)}
            >
              {plan}
            </button>
          );
        })}
      </div>
    </div>
  );
};

PlanSelector.propTypes = {
  setActivePlan: PropTypes.func.isRequired,
  activePlan: PropTypes.string,
  plans: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export { PlanSelector };
export default memo(PlanSelector);
