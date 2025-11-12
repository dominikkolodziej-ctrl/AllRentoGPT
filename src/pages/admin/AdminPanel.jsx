// src/pages/AdminPanel.jsx – szkielet z podpiętymi sekcjami z AdminContext
import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx'; // FAZA 5
import { AdminProvider } from '../../context/AdminContext.jsx';
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 12 WDROŻONA
import { useLiveText } from '@/context/LiveTextContext.jsx'; // ✅ FAZA 1 WDROŻONA

import AdminCompanyList from './admin/AdminCompanyList.jsx'; // FAZA 7
import AdminUserList from './admin/AdminUserList.jsx';
import AdminBillingPanel from './admin/AdminBillingPanel.jsx'; // FAZA 8
import AdminExportPanel from './admin/AdminExportPanel.jsx';   // FAZA 4
import LanguageManager from './admin/LanguageManager.jsx';     // FAZA 1
import ThemeSettings from './admin/ThemeSettings.jsx';
import RegionScopeManager from './admin/RegionScopeManager.jsx';
import StagingControl from './admin/StagingControl.jsx';       // FAZA 7
import SystemAuditLog from './admin/SystemAuditLog.jsx';       // FAZA 8
import AdminAlertsPanel from '../../components/admin/AdminAlertsPanel.jsx'; // FAZA 3
import ContractArchiveAdmin from './admin/ContractArchiveAdmin.jsx'; // FAZA 4
import BenchmarkCountryStats from './admin/BenchmarkCountryStats.jsx';
import MarketSettingsPanel from './admin/MarketSettingsPanel.jsx';
import ThemeSettingsDraftable from './admin/ThemeSettingsDraftable.jsx'; // FAZA 7
import LiveActivityMonitor from './admin/LiveActivityMonitor.jsx';
import ExportTemplateManager from './admin/ExportTemplateManager.jsx'; // FAZA 4/8

const tabs = [
  { label: 'Firmy', path: 'companies' },
  { label: 'Użytkownicy', path: 'users' },
  { label: 'Umowy', path: 'contracts' },
  { label: 'Subskrypcje', path: 'billing' },
  { label: 'Eksport', path: 'export' },
  { label: 'Języki', path: 'languages' },
  { label: 'Wygląd', path: 'theme' },
  { label: 'Kraje', path: 'regions' },
  { label: 'Staging', path: 'staging' },
  { label: 'Audyt', path: 'logs' },
  { label: 'Alerty', path: 'alerts' },
  { label: 'Benchmark', path: 'benchmark' },
  { label: 'Market', path: 'market' },
  { label: 'Drafty', path: 'drafts' },
  { label: 'Live', path: 'activity' },
  { label: 'Szablony', path: 'templates' },
];

export default function AdminPanel() {
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLiveText();

  const logEvent = useCallback((message, extra) => {
    try {
      const body = JSON.stringify({
        ts: Date.now(),
        scope: 'AdminPanel',
        level: 'info',
        message,
        ...(extra || {}),
      });
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/log', blob); // ✅ FAZA 9 WDROŻONA
      } else {
        fetch('/api/analytics/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => undefined);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!authUser || authUser.role !== 'admin') {
      logEvent('unauthorized_redirect');
      navigate('/unauthorized');
    }
  }, [authUser, navigate, logEvent]);

  const translatedTabs = useMemo(
    () =>
      tabs.map((tab) => ({
        ...tab,
        label: t(`admin.tabs.${tab.path}`) || tab.label,
      })),
    [t]
  ); // ✅ FAZA 1 WDROŻONA, ✅ FAZA 13 WDROŻONA

  const handleTabClick = useCallback(
    (path) => {
      logEvent('tab_click', { path });
      navigate(`/admin/${path}`);
    },
    [navigate, logEvent]
  ); // ✅ FAZA 9/13 WDROŻONA

  const isAdmin = !!authUser && authUser.role === 'admin';
  if (!isAdmin) return null; // ✅ FAZA 5 WDROŻONA

  return (
    <AdminProvider>
      <div
        className="max-w-7xl mx-auto p-6 space-y-6"
        style={{
          backgroundColor: theme?.surface || theme?.background || undefined,
          color: theme?.text || undefined,
        }}
      >
        <h1 className="text-3xl font-bold">
          {t('admin.panel.title') || '🛠️ Panel administratora'}
        </h1>
        <p className="opacity-80">
          {t('admin.panel.subtitle') ||
            'Zarządzaj firmami, użytkownikami, wyglądem i działaniem systemu.'}
        </p>

        <div
          className="flex flex-wrap gap-3 mt-6"
          role="tablist"
          aria-label={t('admin.panel.tabs') || 'Zakładki panelu administratora'}
        >
          {translatedTabs.map((tab) => (
            <button
              key={tab.path}
              className="btn btn-outline"
              onClick={() => handleTabClick(tab.path)}
              role="tab"
              style={{
                borderColor: theme?.primary || undefined,
                color: theme?.primary || undefined,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-10">
          <Routes>
            <Route path="companies" element={<AdminCompanyList />} />
            <Route path="users" element={<AdminUserList />} />
            <Route path="billing" element={<AdminBillingPanel />} />
            <Route path="export" element={<AdminExportPanel />} />
            <Route path="languages" element={<LanguageManager />} />
            <Route path="theme" element={<ThemeSettings />} />
            <Route path="regions" element={<RegionScopeManager />} />
            <Route path="staging" element={<StagingControl />} />
            <Route path="logs" element={<SystemAuditLog />} />
            <Route path="alerts" element={<AdminAlertsPanel />} />
            <Route path="contracts" element={<ContractArchiveAdmin />} />
            <Route path="benchmark" element={<BenchmarkCountryStats />} />
            <Route path="market" element={<MarketSettingsPanel />} />
            <Route path="drafts" element={<ThemeSettingsDraftable />} />
            <Route path="activity" element={<LiveActivityMonitor />} />
            <Route path="templates" element={<ExportTemplateManager />} />
          </Routes>
        </div>
      </div>
    </AdminProvider>
  );
}
