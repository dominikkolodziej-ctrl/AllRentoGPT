// src/pages/admin/AdminUserList.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ExportButton from '@/components/common/ExportButton.jsx';
import toast from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/context/LiveTextContext.jsx';

export default function AdminUserList() {
  const { theme } = useTheme();
  const { t } = useLiveText();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const logEvent = useCallback((message, extra) => {
    try {
      const body = JSON.stringify({
        ts: Date.now(),
        scope: 'AdminUserList',
        level: 'info',
        message,
        ...(extra || {}),
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
      /* ignore */
    }
  }, []);

  const load = useCallback(async (signal) => {
    try {
      const res = await fetch('/api/admin/users', { signal });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error((data && data.message) || `HTTP ${res.status}`);
      setUsers(Array.isArray(data) ? data : []);
      logEvent('users_loaded', { count: Array.isArray(data) ? data.length : 0 });
    } catch {
      toast.error(t('admin.users.fetchError') || 'Nie udało się pobrać użytkowników');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [t, logEvent]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const handleToggleRole = useCallback(
    async (userId) => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/toggle-role`, { method: 'PATCH' });
        if (!res.ok) throw new Error('Błąd zmiany roli');
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, role: u.role === 'provider' ? 'client' : 'provider' } : u
          )
        );
        toast.success(t('admin.users.roleChanged') || 'Zmieniono rolę');
        logEvent('user_role_toggled', { userId });
      } catch (err) {
        const msg = err && err.message ? err.message : (t('errors.unknown') || 'Wystąpił błąd');
        toast.error(msg);
        logEvent('user_role_toggle_error', { userId, message: msg });
      }
    },
    [t, logEvent]
  );

  const rows = useMemo(() => users || [], [users]);

  return (
    <div
      className="p-6 max-w-7xl mx-auto"
      style={{
        backgroundColor: theme?.surface || theme?.background || undefined,
        color: theme?.text || undefined,
      }}
    >
      <h2 className="text-2xl font-bold mb-4">
        {t('admin.users.title') || 'Użytkownicy systemu'}
      </h2>
      <ExportButton type="users" />

      {loading ? (
        <p aria-busy="true">{t('common.loading') || 'Ładowanie...'}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full text-sm" style={{ borderColor: theme?.primary || undefined }}>
            <thead>
              <tr>
                <th>{t('admin.users.name') || 'Imię i nazwisko'}</th>
                <th>{t('admin.users.email') || 'Email'}</th>
                <th>{t('admin.users.role') || 'Rola'}</th>
                <th>{t('common.actions') || 'Akcje'}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleToggleRole(u._id)}
                      style={{
                        borderColor: theme?.primary || undefined,
                        color: theme?.primary || undefined,
                      }}
                    >
                      {t('admin.users.changeRole') || 'Zmień rolę'}
                    </button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={4} className="text-center opacity-70 py-6">
                    {t('common.noResults') || 'Brak wyników.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
