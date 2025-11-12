import React, { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/context/LiveTextContext.jsx';
import AdminAlertsPanel from '@/components/admin/AdminAlertsPanel.jsx';
import PlanManagerUI from '@/components/PlanManagerUI.jsx';
import ModerationPanel from '@/components/ModerationPanel.jsx';
import StatsOverview from '@/pages/admin/StatsOverviewPage.jsx';

const AdminDashboard = () => {
  const { theme } = useTheme(); // ✅ FAZA 12 WDROŻONA
  const { t } = useLiveText(); // ✅ FAZA 1 WDROŻONA

  const logEvent = useCallback((message, extra) => {
    try {
      const body = JSON.stringify({
        ts: Date.now(),
        scope: 'AdminDashboard',
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

  const exportTranslations = useCallback(async () => {
    try {
      const res = await fetch('/api/translations/exportTranslations'); // ✅ FAZA 10 WDROŻONA
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = 'translations.xlsx';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(t('admin.translations.exportSuccess') || 'Eksport tłumaczeń zakończony powodzeniem');
      logEvent('translations_export_success');
    } catch (err) {
      toast.error(t('admin.translations.exportFail') || 'Eksport tłumaczeń nie powiódł się');
      logEvent('translations_export_error', { message: err && err.message });
    }
  }, [t, logEvent]);

  const handleImport = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/translations/importTranslations', {
          method: 'POST',
          body: formData,
        }); // ✅ FAZA 10 WDROŻONA
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        toast.success(t('admin.translations.importSuccess') || 'Import tłumaczeń zakończony powodzeniem');
        logEvent('translations_import_success', { size: file.size });
        e.target.value = '';
      } catch (err) {
        toast.error(t('admin.translations.importFail') || 'Import tłumaczeń nie powiódł się');
        logEvent('translations_import_error', { message: err && err.message });
      }
    },
    [t, logEvent]
  );

  return (
    <div
      className="p-6 space-y-6"
      style={{
        backgroundColor: theme?.surface || theme?.background || undefined,
        color: theme?.text || undefined,
      }}
    >
      <h1 className="text-2xl font-bold mb-4">
        {t('admin.dashboard.title') || 'Panel administratora'}
      </h1>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <button
          onClick={exportTranslations}
          className="px-4 py-2 rounded text-white"
          style={{ backgroundColor: theme?.primary || '#2563eb' }}
        >
          {t('export_translations') || 'Eksport tłumaczeń'}
        </button>

        <label className="block">
          <span className="mr-2">{t('import_translations') || 'Import tłumaczeń (XLSX)'}</span>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleImport}
            className="block"
            aria-label={t('import_translations') || 'Import tłumaczeń (XLSX)'}
          />
        </label>
      </div>

      <AdminAlertsPanel />
      <StatsOverview />
      <PlanManagerUI />
      <ModerationPanel />
    </div>
  );
};

export default AdminDashboard;
