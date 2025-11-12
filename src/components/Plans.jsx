import React, { memo, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const plans = [
  {
    name: 'Start',
    price: '0 zł',
    features: ['1 aktywna oferta', 'Logo i opis firmy', 'Odbieranie wiadomości'],
    badge: 'Dla testujących',
    color: 'gray',
  },
  {
    name: 'Pro',
    price: '49 zł / mies.',
    features: ['10 aktywnych ofert', 'Dostęp do mapy', 'Statystyki wyświetleń', 'Wysyłanie wiadomości zbiorczych'],
    badge: 'Najpopularniejszy',
    color: 'blue',
  },
  {
    name: 'Premium',
    price: '99 zł / mies.',
    features: ['Nieograniczona liczba ofert', 'Promocja w wynikach', 'Powiadomienia e-mail/SMS', 'Dostęp do API'],
    badge: 'Pełna moc',
    color: 'purple',
  },
  {
    name: 'Elite',
    price: '199 zł / mies.',
    features: ['Wszystko z Premium', 'Eksport danych', 'Integracje z CRM', 'Zaawansowane statystyki'],
    badge: 'Dla liderów branży',
    color: 'yellow',
  },
];

const badgeColorMap = {
  gray: 'bg-gray-600',
  blue: 'bg-blue-600',
  purple: 'bg-purple-600',
  yellow: 'bg-yellow-600',
};

const SubscriptionPlans = ({ onEvent, className = '' }) => {
  const navigate = useNavigate();
  const { t } = useLiveText();
  const { theme } = useTheme();

  const initialPlan = useMemo(
    () => localStorage.getItem('subscriptionPlan') || t('plans.none') || 'Brak aktywnego planu',
    [t]
  );
  const [currentPlan, setCurrentPlan] = useState(initialPlan);

  const handleSelect = useCallback(
    (plan) => {
      localStorage.setItem('subscriptionPlan', plan.name);
      setCurrentPlan(plan.name);
      onEvent?.('subscription_plan_selected', { plan: plan.name });
      navigate('/dashboard');
    },
    [navigate, onEvent]
  );

  const containerCls = `max-w-7xl mx-auto py-16 px-6 ${className}`;
  const titleCls = theme?.heading1 ?? 'text-4xl font-bold text-center text-blue-700 mb-10';
  const cardGridCls = 'grid md:grid-cols-4 gap-6';
  const cardCls = (selected) =>
    `${
      theme?.card ?? 'bg-white border shadow-md rounded-xl p-6 flex flex-col justify-between hover:shadow-lg transition'
    } ${selected ? theme?.selectedCard ?? 'ring-2 ring-blue-500' : ''}`;
  const priceCls = theme?.priceText ?? 'text-lg font-semibold mb-4';
  const planNameCls = theme?.cardTitle ?? 'text-2xl font-bold text-blue-700 mb-2';
  const featureListCls = 'text-sm text-gray-600 space-y-2 mb-6';
  const btnCls =
    theme?.primaryButton ?? 'mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition';
  const badgeBase = 'text-xs px-2 py-1 rounded-full w-fit mb-4 text-white';

  return (
    <div className={containerCls}>
      <h1 className={titleCls}>{t('plans.choose') || 'Wybierz plan subskrypcji'}</h1>

      <p className="text-center text-sm mb-6 text-gray-600">
        {t('plans.current') || 'Twój aktualny plan'}:{' '}
        <span className="font-semibold text-blue-600">{currentPlan}</span>
      </p>

      <div className={cardGridCls}>
        {plans.map((plan) => {
          const selected = currentPlan === plan.name;
          return (
            <div key={plan.name} className={cardCls(selected)} aria-current={selected ? 'true' : undefined}>
              <div>
                <div className={`${badgeBase} ${badgeColorMap[plan.color] ?? 'bg-gray-600'}`}>{plan.badge}</div>
                <h2 className={planNameCls}>{plan.name}</h2>
                <p className={priceCls}>{plan.price}</p>
                <ul className={featureListCls}>
                  {plan.features.map((feature) => (
                    <li key={`${plan.name}-${feature}`}>• {feature}</li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleSelect(plan)}
                className={btnCls}
                disabled={selected}
                aria-pressed={selected ? 'true' : 'false'}
                aria-label={
                  selected
                    ? (t('plans.current') || 'Obecny plan')
                    : `${t('plans.select') || 'Wybierz plan'}: ${plan.name}`
                }
              >
                {selected ? t('plans.current') || 'Obecny plan' : t('plans.select') || 'Wybierz plan'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

SubscriptionPlans.propTypes = {
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export default memo(SubscriptionPlans);
