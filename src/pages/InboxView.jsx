import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import { Button } from "@/components/ui/button.jsx";

const InboxView = () => {
  const { authUser, token } = useAuth();
  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;
  const ui = useMemo(
    () => ({
      page: `p-4 max-w-3xl mx-auto ${theme?.classes?.page || ""}`.trim(),
      title: "text-2xl font-bold mb-4",
      tools: "flex gap-2 mb-4",
      card: `border p-3 rounded-md bg-white shadow-sm flex items-start gap-3 ${theme?.classes?.card || ""}`.trim(),
      link: `text-blue-600 hover:underline font-semibold ${theme?.classes?.link || ""}`.trim(),
      muted: `text-gray-500 text-sm ${theme?.classes?.mutedText || ""}`.trim(),
      tiny: "text-xs text-gray-400",
      btnWarn: `btn btn-sm btn-warning ${theme?.classes?.button || ""}`.trim(),
      btnNeutral: `btn btn-sm btn-neutral ${theme?.classes?.button || ""}`.trim(),
    }),
    [theme]
  );

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");

  const userId =
    authUser?.id || authUser?._id || authUser?.userId || authUser?.user?.id || null;

  const authHeader = useMemo(() => {
    const tkn =
      token ||
      authUser?.token ||
      (typeof window !== "undefined" ? window.localStorage.getItem("token") : null);
    return tkn ? { Authorization: `Bearer ${tkn}` } : {};
  }, [token, authUser?.token]);

  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    const ctrl = new AbortController();
    try {
      const res = await axios.get(`/api/messages/inbox/${userId}`, {
        headers: authHeader,
        signal: ctrl.signal,
      });
      setConversations(Array.isArray(res.data) ? res.data : []);
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon(
          "/api/audit/event",
          new Blob(
            [JSON.stringify({ type: "inbox_view", count: (res.data || []).length, ts: Date.now() })],
            { type: "application/json" }
          )
        );
      }
    } catch (e) {
      if (!axios.isCancel(e)) {
        setError(t("inbox.fetchError", "Błąd przy pobieraniu wiadomości"));
        toast.error(t("inbox.fetchError", "Błąd przy pobieraniu wiadomości"));
      }
    } finally {
      setLoading(false);
    }
    return () => ctrl.abort();
  }, [userId, authHeader, t]);

  useEffect(() => {
    const abort = fetchConversations();
    return () => {
      if (typeof abort === "function") abort();
    };
  }, [fetchConversations]);

  const toggleSelect = useCallback((id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }, []);

  const bulkArchive = useCallback(async () => {
    if (selected.length === 0) return;
    try {
      await axios.put("/api/messages/archive", { ids: selected }, { headers: authHeader });
      toast.success(t("inbox.archived", "Wiadomości zarchiwizowane"));
      setConversations((prev) => prev.filter((c) => !selected.includes(c._id)));
      setSelected([]);
    } catch {
      toast.error(t("inbox.archiveFail", "Nie udało się zarchiwizować"));
    }
  }, [selected, authHeader, t]);

  const bulkMarkUnread = useCallback(async () => {
    if (selected.length === 0) return;
    try {
      await axios.put("/api/messages/mark-unread", { ids: selected }, { headers: authHeader });
      toast.success(t("inbox.markedUnread", "Oznaczono jako nieprzeczytane"));
      setSelected([]);
    } catch {
      toast.error(t("inbox.markUnreadFail", "Nie udało się oznaczyć"));
    }
  }, [selected, authHeader, t]);

  if (!authUser) return null;

  if (loading) return <p className="p-4" aria-live="polite">{t("common.loading", "Wczytywanie wiadomości...")}</p>;

  if (error) return <p className="p-4 text-red-600" role="alert">{error}</p>;

  if (conversations.length === 0)
    return <p className="p-4 text-gray-500">{t("inbox.empty", "Brak wiadomości.")}</p>;

  return (
    <div className={ui.page} data-screen="inbox-view" data-theme={dataTheme}>
      <h2 className={ui.title}>📥 {t("inbox.title", "Skrzynka odbiorcza")}</h2>

      {selected.length > 0 && (
        <div className={ui.tools}>
          <Button onClick={bulkArchive} className={ui.btnWarn} aria-label={t("inbox.archive", "Archiwizuj")}>
            🗃️ {t("inbox.archive", "Archiwizuj")}
          </Button>
          <Button onClick={bulkMarkUnread} className={ui.btnNeutral} aria-label={t("inbox.markUnread", "Oznacz jako nieprzeczytane")}>
            📩 {t("inbox.markUnread", "Oznacz jako nieprzeczytane")}
          </Button>
        </div>
      )}

      <ul className="space-y-2">
        {conversations.map((conv) => (
          <li key={conv._id} className={ui.card}>
            <input
              type="checkbox"
              checked={selected.includes(conv._id)}
              onChange={() => toggleSelect(conv._id)}
              className="mt-1"
              aria-label={t("inbox.select", "Zaznacz konwersację")}
            />
            <div className="flex-1">
              <Link to={`/messages/${conv._id}`} className={ui.link}>
                {conv.subject || t("inbox.noSubject", "(bez tematu)")}
              </Link>
              <p className={ui.muted}>{conv.preview}</p>
              <p className={ui.tiny}>
                {conv.updatedAt ? new Date(conv.updatedAt).toLocaleString() : "—"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InboxView;
