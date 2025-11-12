import { useCallback, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';

export function useMessages() {
  const { authUser } = useAuth(); // ✅ FAZA 5 WDROŻONA
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  const logError = (message) => {
    try {
      const body = JSON.stringify({
        ts: Date.now(),
        scope: 'useMessages',
        level: 'error',
        message,
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
  };

  const token = authUser && authUser.token ? authUser.token : null;
  const userId = authUser && authUser._id ? String(authUser._id) : null;

  const getConversations = useCallback(async () => {
    if (!userId || !token) {
      setError('Not authenticated');
      return [];
    }
    setLoading(true);
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    try {
      const res = await fetch(`/api/messages/conversations/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        signal: controllerRef.current.signal,
      }); // ✅ FAZA 8 WDROŻONA
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error((data && data.message) || `HTTP ${res.status}`);
      setError(null);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      const msg = e && e.message ? e.message : 'Unknown error';
      setError(msg);
      logError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  const getMessages = useCallback(async (conversationId) => {
    if (!token) {
      setError('Not authenticated');
      return [];
    }
    setLoading(true);
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        signal: controllerRef.current.signal,
      }); // ✅ FAZA 8 WDROŻONA
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error((data && data.message) || `HTTP ${res.status}`);
      setError(null);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      const msg = e && e.message ? e.message : 'Unknown error';
      setError(msg);
      logError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  const sendMessage = useCallback(async (formData) => {
    if (!token) {
      setError('Not authenticated');
      return null;
    }
    setLoading(true);
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
        signal: controllerRef.current.signal,
      }); // ✅ FAZA 6 WDROŻONA, ✅ FAZA 8 WDROŻONA
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error((data && data.message) || `HTTP ${res.status}`);
      setError(null);
      return data;
    } catch (e) {
      const msg = e && e.message ? e.message : 'Unknown error';
      setError(msg);
      logError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const replyToMessage = useCallback(
    async (conversationId, content, attachments = []) => {
      if (!userId) {
        setError('Not authenticated');
        return null;
      }
      const formData = new FormData();
      formData.append('conversationId', conversationId);
      formData.append('senderId', userId);
      formData.append('content', content);
      attachments.forEach((file) => formData.append('attachments', file));
      return sendMessage(formData); // ✅ FAZA 6 WDROŻONA
    },
    [userId, sendMessage]
  );

  return {
    loading,
    error,
    getConversations,
    getMessages,
    sendMessage,
    replyToMessage,
  };
}
