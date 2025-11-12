// src/pages/dashboard/provider/ProviderCalendar.jsx

import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format, isAfter, parseISO } from 'date-fns';
import { useTheme } from '@/context/ThemeContext.jsx'; // ✅ FAZA 12 WDROŻONA
import { useLiveText } from '@/context/LiveTextContext.jsx'; // ✅ FAZA 1 WDROŻONA
import { useAuth } from '@/context/AuthContext.jsx'; // ✅ FAZA 5 WDROŻONA

export default function ProviderCalendar() {
  const { theme } = useTheme();
  const { t } = useLiveText();
  const { authUser } = useAuth();

  const [blocks, setBlocks] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [tag, setTag] = useState('inne');
  const [loading, setLoading] = useState(false);

  const logEvent = useCallback((message, extra) => {
    try {
      const body = JSON.stringify({
        ts: Date.now(),
        scope: 'ProviderCalendar',
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

  const fetchBlocks = useCallback(async (signal) => {
    try {
      setLoading(true);
      const res = await axios.get('/api/calendar/my', {
        signal,
        headers: authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : undefined,
      }); // ✅ FAZA 8 WDROŻONA
      setBlocks(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error(t('calendar.fetchError') || 'Błąd pobierania kalendarza');
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  }, [authUser?.token, t]);

  useEffect(() => {
    const controller = new AbortController();
    fetchBlocks(controller.signal);
    return () => controller.abort(); // ✅ FAZA 13 WDROŻONA
  }, [fetchBlocks]);

  const addBlock = useCallback(async () => {
    if (!from || !to) {
      toast.error(t('calendar.missingRange') || 'Uzupełnij zakres dat');
      return;
    }
    if (isAfter(new Date(from), new Date(to))) {
      toast.error(t('calendar.invalidRange') || 'Data OD musi być wcześniejsza niż DO');
      return;
    }

    try {
      await axios.post(
        '/api/calendar/block',
        { from, to, tag },
        { headers: authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : undefined }
      ); // ✅ FAZA 8 WDROŻONA
      toast.success(t('calendar.added') || 'Dodano blokadę');
      logEvent('calendar_block_added', { from, to, tag });
      setFrom('');
      setTo('');
      setTag('inne');
      const controller = new AbortController();
      fetchBlocks(controller.signal).finally(() => controller.abort());
    } catch (err) {
      const msg = err?.response?.data?.error || t('calendar.addError') || 'Błąd dodawania blokady';
      toast.error(msg);
    }
  }, [from, to, tag, authUser?.token, t, logEvent, fetchBlocks]);

  const deleteBlock = useCallback(
    async (id) => {
      try {
        await axios.delete(`/api/calendar/${id}`, {
          headers: authUser?.token ? { Authorization: `Bearer ${authUser.token}` } : undefined,
        }); // ✅ FAZA 8 WDROŻONA
        toast.success(t('calendar.deleted') || 'Usunięto blokadę');
        logEvent('calendar_block_deleted', { id });
        setBlocks((prev) => prev.filter((b) => b._id !== id));
      } catch {
        toast.error(t('calendar.deleteError') || 'Błąd usuwania blokady');
      }
    },
    [authUser?.token, t, logEvent]
  );

  return (
    <div
      className="p-4 max-w-3xl mx-auto"
      style={{
        backgroundColor: theme?.surface || theme?.background || undefined,
        color: theme?.text || undefined,
      }}
    >
      <h2 className="text-2xl font-bold mb-4">
        {t('calendar.title') || '📅 Kalendarz dostępności'}
      </h2>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <label className="flex-1">
          <span className="sr-only">{t('calendar.from') || 'Od'}</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="input input-bordered w-full"
            aria-label={t('calendar.from') || 'Od'}
          />
        </label>
        <label className="flex-1">
          <span className="sr-only">{t('calendar.to') || 'Do'}</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="input input-bordered w-full"
            aria-label={t('calendar.to') || 'Do'}
          />
        </label>
        <label className="flex-1">
          <span className="sr-only">{t('calendar.tag') || 'Tag'}</span>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="select select-bordered w-full"
            aria-label={t('calendar.tag') || 'Tag'}
          >
            <option value="urlop">{t('calendar.tag.vacation') || 'Urlop'}</option>
            <option value="naprawa">{t('calendar.tag.repair') || 'Naprawa'}</option>
            <option value="wydarzenie">{t('calendar.tag.event') || 'Wydarzenie'}</option>
            <option value="inne">{t('calendar.tag.other') || 'Inne'}</option>
          </select>
        </label>
        <button
          onClick={addBlock}
          className="btn btn-primary"
          style={{ backgroundColor: theme?.primary || undefined, borderColor: theme?.primary || undefined }}
          disabled={loading}
        >
          {t('calendar.add') || 'Dodaj'}
        </button>
      </div>

      {loading ? (
        <p aria-busy="true">{t('common.loading') || 'Ładowanie...'}</p>
      ) : (
        <ul className="space-y-3">
          {blocks.map((b) => (
            <li
              key={b._id}
              className="border p-3 rounded-lg shadow-sm flex justify-between items-center"
              style={{
                backgroundColor: theme?.surface || '#fff',
                borderColor: theme?.primary || undefined,
              }}
            >
              <div>
                <p className="font-medium">
                  {b.from ? format(parseISO(b.from), 'dd.MM.yyyy') : '-'} –{' '}
                  {b.to ? format(parseISO(b.to), 'dd.MM.yyyy') : '-'}
                </p>
                <p className="text-sm opacity-70">
                  {t('calendar.tagLabel') || 'Tag'}: {b.tag}
                </p>
              </div>
              <button
                onClick={() => deleteBlock(b._id)}
                className="btn btn-sm btn-outline btn-error"
              >
                {t('common.delete') || 'Usuń'}
              </button>
            </li>
          ))}
          {!blocks.length && (
            <li className="opacity-70">{t('common.noResults') || 'Brak wyników.'}</li>
          )}
        </ul>
      )}
    </div>
  );
}
