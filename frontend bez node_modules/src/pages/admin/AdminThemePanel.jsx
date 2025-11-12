// src/pages/AdminThemePanel.jsx
import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeManager } from '../components/ThemeManager';
import { useAuth } from '@/context/AuthContext.jsx';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/context/LiveTextContext.jsx';

export const AdminThemePanel = () => {
  const { authUser } = useAuth(); // ✅ FAZA 5 WDROŻONA
  const { theme } = useTheme(); // ✅ FAZA 12 WDROŻONA
  const { t } = useLiveText(); // ✅ FAZA 1 WDROŻONA
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser || authUser.role !== 'admin') {
      navigate('/');
    }
  }, [authUser, navigate]);

  const handleThemeSave = useCallback(async (nextTheme) => {
    try {
      await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextTheme),
      }); // ✅ FAZA 8 WDROŻONA
      // Integracja z analityką
      try {
        const body = JSON.stringify({
          ts: Date.now(),
          scope: 'AdminThemePanel',
          level: 'info',
          message: 'theme_saved',
        });
        if (navigator.sendBeacon) {
          const blob = new Blob([body], { type: 'application/json' });
          navigator.sendBeacon('/api/analytics/log', blob);
        } else {
          fetch('/api/analytics/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
          }).catch(() => undefined);
        }
      } catch {
        /* ignore analytics error */
      } // ✅ FAZA 9 WDROŻONA
      // console.log('🔧 Zapisano motyw:', nextTheme);
    } catch {
      // console.warn('Nie udało się zapisać motywu');
    }
  }, []);

  if (!authUser || authUser.role !== 'admin') return null;

  return (
    <div
      className="max-w-3xl mx-auto py-8"
      style={{
        backgroundColor: theme?.surface || theme?.background || undefined,
        color: theme?.text || undefined,
      }}
    >
      <h1 className="text-2xl font-bold mb-4">
        {t('admin.theme.title') || '🎨 Ustawienia wyglądu systemu'}
      </h1>
      <ThemeManager onSave={handleThemeSave} />
    </div>
  );
};

export default AdminThemePanel;
