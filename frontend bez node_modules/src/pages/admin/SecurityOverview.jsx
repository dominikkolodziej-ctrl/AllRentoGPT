import clsx from 'clsx';
import React from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';

const SecurityOverview = () => {
  const theme = useTheme();

  const items = [
    '📍 IP: 83.12.54.1 – logowanie admin',
    '🚨 Próba dostępu do zabronionej strefy',
    '🔒 MFA: aktywne dla konta głównego',
  ];

  return (
    <div className={clsx('p-6', theme.background, theme.text)}>
      <h2 className="text-xl font-bold mb-4">Bezpieczeństwo i aktywność</h2>
      <ul className="space-y-4">
        {items.map((text, i) => (
          <li key={i} className={clsx('p-4 rounded', theme.border)}>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SecurityOverview;
