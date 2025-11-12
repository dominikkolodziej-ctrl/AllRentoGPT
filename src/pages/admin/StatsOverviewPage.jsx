import clsx from 'clsx';
import React from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';

// ✅ FAZA 8: Dashboard / statystyki / metryki systemowe

const StatsOverviewPage = () => {
  const theme = useTheme();

  return (
    <div className={clsx('p-6', theme.background, theme.text)}>
      <h2 className="text-xl font-bold mb-4">Statystyki systemowe</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={clsx('p-4', theme.border, theme.radius)}>📈 CTR: 8.2%</div>
        <div className={clsx('p-4', theme.border, theme.radius)}>👥 Nowi użytkownicy: 132</div>
        <div className={clsx('p-4', theme.border, theme.radius)}>📄 Wysłane umowy: 57</div>
      </div>
    </div>
  );
};

export default StatsOverviewPage;
