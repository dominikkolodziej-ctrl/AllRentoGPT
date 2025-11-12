// src/pages/dashboard/provider/PlanManager.jsx – wersja enterprise z historią

import React, { useContext, useState } from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';
import { AuthContext } from '@/context/AuthContext.jsx';
import toast from 'react-hot-toast';
import SubscriptionHistory from './SubscriptionHistory';
import axios from 'axios';

const availablePlans = [
  {
    name: 'Start',
    price: '0 zł',
    value: 'start',
    features: ['1 aktywna oferta', 'Logo firmy', 'Odbieranie wiadomości'],
    color: 'gray',
  },
  {
    name: 'Pro',
    price: '49 zł/mies.',
    value: 'pro',
    features: ['10 ofert', 'Dostęp do mapy', 'Statystyki', 'Wysyłanie umów'],
    color: 'blue',
  },
  {
    name: 'Premium',
    price: '99 zł/mies.',
    value: 'premium',
    features: ['Bez limitu', 'Promowanie ofert', 'API + eksport', 'E-mail/SMS powiadomienia'],
    color: 'purple',
  },
];

const colorClass = {
  gray: 'bg-gray-50',
  blue: 'bg-blue-50',
  purple: 'bg-purple-50',
};

export default function PlanManager() {
  const theme = useTheme();
  const { user, updateUser } = useContext(AuthContext) || {};
  const [activating, setActivating] = useState(null);

  const uid = user?.id ?? user?._id ?? null;
  const token = user?.token ?? null;
  const currentPlan = user?.plan ?? null;

  const activatePlan = async (plan) => {
    if (!uid) {
      toast.error('Brak identyfikatora użytkownika');
      return;
    }
    try {
      setActivating(plan);
      await axios.post(
        '/api/subscription/activate',
        { userId: uid, plan },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      updateUser?.({ ...user, plan });
      toast.success(`Plan ${plan} aktywowany`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Nie udało się aktywować planu';
      toast.error(msg);
    } finally {
      setActivating(null);
    }
  };

  return (
    <div className={`${theme.background} ${theme.text} p-4 max-w-5xl mx-auto`}>
      <h2 className="text-2xl font-bold mb-6">📦 Twój Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {availablePlans.map((p) => {
          const isActive = currentPlan === p.value;
          const isLoading = activating === p.value;
          return (
            <div
              key={p.value}
              className={`border p-4 rounded-xl shadow-sm ${theme.border} ${theme.radius} ${colorClass[p.color] || ''}`}
            >
              <h3 className="text-lg font-semibold mb-2">{p.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{p.price}</p>
              <ul className="text-sm mb-4 list-disc list-inside">
                {p.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => activatePlan(p.value)}
                disabled={isActive || isLoading || !uid}
                aria-disabled={isActive || isLoading || !uid}
                className={`btn btn-sm ${isActive ? 'btn-disabled' : ''} ${!isActive ? theme.primary : ''}`}
                aria-label={isActive ? `Plan ${p.name} jest aktywny` : `Aktywuj plan ${p.name}`}
              >
                {isActive ? 'Aktywny' : isLoading ? 'Aktywowanie…' : 'Aktywuj'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        {uid && <SubscriptionHistory userId={uid} />}
      </div>
    </div>
  );
}
