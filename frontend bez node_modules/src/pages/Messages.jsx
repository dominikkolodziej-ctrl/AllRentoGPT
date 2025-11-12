import React, { useCallback, useEffect, useMemo, useState } from "react";
import InboxView from "../components/messages/InboxView";
import ConversationThread from "../components/messages/ConversationThread";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";

const Messages = () => {
  const [activeConversation, setActiveConversation] = useState(null);

  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;

  const ui = useMemo(
    () => ({
      page: `flex h-screen ${theme?.classes?.page || ""}`.trim(),
      list: `w-full sm:w-1/3 border-r overflow-y-auto ${theme?.classes?.card || ""}`.trim(),
      thread: "hidden sm:flex flex-1 overflow-y-auto",
      empty: `m-auto text-gray-400 ${theme?.classes?.mutedText || ""}`.trim(),
    }),
    [theme]
  );

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "messages_view", ts: Date.now() })], {
          type: "application/json",
        })
      );
    }
  }, []);

  useEffect(() => {
    if (!activeConversation) return;
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob(
          [JSON.stringify({ type: "conversation_open", id: activeConversation._id || activeConversation.id, ts: Date.now() })],
          { type: "application/json" }
        )
      );
    }
  }, [activeConversation]);

  return (
    <div className={ui.page} data-screen="messages" data-theme={dataTheme}>
      <div className={ui.list} role="navigation" aria-label={t("messages.inboxNav", "Lista wiadomości")}>
        <InboxView onSelect={setActiveConversation} />
      </div>

      <div className={ui.thread} role="main" aria-live="polite">
        {activeConversation ? (
          <ConversationThread conversation={activeConversation} />
        ) : (
          <div className={ui.empty}>{t("messages.choose", "Wybierz rozmowę, aby ją otworzyć")}</div>
        )}
      </div>
    </div>
  );
};

export default Messages;
