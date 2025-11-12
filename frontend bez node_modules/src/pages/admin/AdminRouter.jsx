import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/context/LiveTextContext.jsx';

const AdminDashboard = lazy(() => import('./AdminDashboard.jsx'));
const StatsOverviewPage = lazy(() => import('./StatsOverviewPage.jsx'));
const InvoiceViewer = lazy(() => import('./InvoiceViewer.jsx'));

const AdminRouter = () => {
  const { theme } = useTheme();
  const { t } = useLiveText();

  return (
    <Suspense
      fallback={
        <div
          className="p-6"
          style={{
            backgroundColor: theme?.surface || theme?.background || undefined,
            color: theme?.text || undefined,
          }}
        >
          {t('common.loading') || 'Ładowanie…'}
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="stats" element={<StatsOverviewPage />} />
        <Route path="invoices" element={<InvoiceViewer />} />
      </Routes>
    </Suspense>
  );
};

export default AdminRouter;
