// src/pages/dashboard/provider/ProviderInbox.jsx

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import { useMessages } from '@/hooks/useMessages.ts';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/context/LiveTextContext.jsx';
import MessageItem from '@/components/messages/MessageItem.jsx';

const ProviderInbox = () => {
  const { authUser } = useAuth(); // ✅ FAZA 5 WDROŻONA
  const { theme } = useTheme(); // ✅ FAZA 12 WDROŻONA
  const { t } = useLiveText(); // ✅ FAZA 1 WDROŻONA

  const { loading, error, getConversations, getMessages } = useMessages(); // ✅ FAZA 6 WDROŻONA

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);

  const loadConversations = useCallback(async () => {
    const data = await getConversations();
    setConversations(Array.isArray(data) ? data : []);
  }, [getConversations]);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    const data = await getMessages(conversationId);
    setMessages(Array.isArray(data) ? data : []);
  }, [getMessages]);

  useEffect(() => {
    if (!authUser?._id) return;
    loadConversations();
  }, [authUser, loadConversations]);

  useEffect(() => {
    loadMessages(selectedId);
  }, [selectedId, loadMessages]);

  const hasConversations = conversations.length > 0;
  const headerTitle = t('inbox.provider.title') || '📨 Wiadomości — Dostawca';

  const safeConvLabel = useCallback((c, idx) => {
    return c?.subject || c?.title || c?._id || `${t('inbox.conversation') || 'Rozmowa'} #${idx + 1}`;
  }, [t]);

  const convRows = useMemo(() => conversations.map((c, idx) => ({
    id: c?._id || String(idx),
    label: safeConvLabel(c, idx),
  })), [conversations, safeConvLabel]);

  return (
    <div
      className="p-6 space-y-4"
      style={{
        backgroundColor: theme?.surface || theme?.background || undefined,
        color: theme?.text || undefined,
      }}
    >
      <h1 className="text-2xl font-semibold mb-4">{headerTitle}</h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <aside className="md:col-span-4 space-y-2">
          <h2 className="text-lg font-semibold">
            {t('inbox.conversations') || 'Rozmowy'}
          </h2>

          {loading && <p className="opacity-70">{t('common.loading') || 'Ładowanie...'}</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !hasConversations && (
            <p className="opacity-70">{t('inbox.empty') || 'Brak rozmów.'}</p>
          )}

          <ul className="space-y-2">
            {convRows.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(row.id)}
                  className="w-full text-left btn btn-outline"
                  aria-pressed={selectedId === row.id}
                  style={{
                    borderColor: selectedId === row.id ? theme?.primary || undefined : undefined,
                    color: selectedId === row.id ? theme?.primary || undefined : undefined,
                  }}
                >
                  {row.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="md:col-span-8">
          <h2 className="text-lg font-semibold mb-2">
            {t('inbox.messages') || 'Wiadomości'}
          </h2>

          {selectedId == null && hasConversations && (
            <p className="opacity-70">
              {t('inbox.pickConversation') || 'Wybierz rozmowę z listy po lewej.'}
            </p>
          )}

          {loading && selectedId && <p className="opacity-70">{t('common.loading') || 'Ładowanie...'}</p>}

          {!loading && selectedId && messages.length === 0 && (
            <p className="opacity-70">{t('inbox.noMessages') || 'Brak wiadomości w tej rozmowie.'}</p>
          )}

          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageItem key={msg._id} message={msg} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProviderInbox;
