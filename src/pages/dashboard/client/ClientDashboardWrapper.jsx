import clsx from 'clsx';
import React, { Suspense } from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';

const RecommendedAssetsPanel = React.lazy(() => import('@/components/dashboard/RecommendedAssetsPanel.jsx'));
const ClientFavorites = React.lazy(() => import('./ClientFavorites'));
const ClientInbox = React.lazy(() => import('./ClientInbox'));
const ClientReservations = React.lazy(() => import('./ClientReservations'));
const Timeline = React.lazy(() => import('./Timeline'));

const ClientDashboardWrapper = () => {
  const theme = useTheme();

  return (
    <div className={clsx('p-6 space-y-6', theme.background, theme.text)}>
      <h1 className="text-2xl font-bold">Mój Panel Klienta</h1>

      <Suspense fallback={<div className="opacity-70">Ładowanie rekomendacji…</div>}>
        <RecommendedAssetsPanel />
      </Suspense>

      <Suspense fallback={<div className="opacity-70">Ładowanie skrzynki…</div>}>
        <ClientInbox />
      </Suspense>

      <Suspense fallback={<div className="opacity-70">Ładowanie rezerwacji…</div>}>
        <ClientReservations />
      </Suspense>

      <Suspense fallback={<div className="opacity-70">Ładowanie ulubionych…</div>}>
        <ClientFavorites />
      </Suspense>

      <Suspense fallback={<div className="opacity-70">Ładowanie osi czasu…</div>}>
        <Timeline />
      </Suspense>
    </div>
  );
};

export default ClientDashboardWrapper;
