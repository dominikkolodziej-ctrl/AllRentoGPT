// 📍 src/components/admin/SystemAlertSender.jsx (v2 ENTERPRISE)
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { toast } from "@/lib/toast";
import { useLiveText } from "@/context/LiveTextContext.jsx";

export default function SystemAlertSender() {
  const [target, setTarget] = useState("all");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [lastAlert, setLastAlert] = useState(null);

  const live = useLiveText();
  const t = useCallback(
    (k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k),
    [live]
  );

  const canSend = useMemo(() => message.trim().length >= 3 && !!target.trim(), [message, target]);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "system_alert_sender_view", ts: Date.now() })], {
          type: "application/json",
        })
      );
    }
  }, []);

  const cancelAlert = useCallback(async (meta) => {
    if (!meta) return;
    try {
      const url =
        meta.undoUrl || meta.cancelUrl || (meta.id ? `/api/system/alert/${meta.id}` : null);
      if (!url) throw new Error("Brak endpointu cofnięcia");
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Nie udało się cofnąć alertu");
      toast.success(t("system.alertUndone", "Alert cofnięty"));
      setLastAlert(null);
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon(
          "/api/audit/event",
          new Blob([JSON.stringify({ type: "system_alert_undo", id: meta.id ?? null, ts: Date.now() })], {
            type: "application/json",
          })
        );
      }
    } catch {
      toast.error(t("system.alertUndoFail", "Nie można cofnąć alertu"));
    }
  }, [t]);

  const handleSend = useCallback(async () => {
    if (!canSend) return;
    setSending(true);
    try {
      const res = await fetch("/api/system/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: target.trim(), message: message.trim() }),
      });
      if (!res.ok) throw new Error("Błąd wysyłki");
      const data = await res.json().catch(() => ({}));
      const meta = {
        id: data?.id || data?.alertId || null,
        undoUrl: data?.undoUrl || data?.cancelUrl || null,
      };
      setLastAlert(meta);
      toast.custom(
        (tctx) => (
          <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 rounded border px-3 py-2 shadow">
            <span>{t("system.alertSent", "Alert wysłany")}</span>
            {(meta.id || meta.undoUrl) && (
              <button
                className="px-3 py-1.5 rounded border"
                onClick={() => {
                  cancelAlert(meta);
                  toast.dismiss(tctx.id);
                }}
                aria-label={t("common.undo", "Cofnij")}
              >
                {t("common.undo", "Cofnij")}
              </button>
            )}
          </div>
        ),
        { duration: 6000 }
      );
      setMessage("");
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon(
          "/api/audit/event",
          new Blob(
            [JSON.stringify({ type: "system_alert_sent", target: target.trim(), ts: Date.now() })],
            { type: "application/json" }
          )
        );
      }
    } catch {
      toast.error(t("system.alertFail", "Nie udało się wysłać alertu"));
    } finally {
      setSending(false);
    }
  }, [canSend, cancelAlert, message, t, target]);

  const onKeyDown = useCallback(
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && canSend && !sending) {
        e.preventDefault();
        handleSend();
      }
    },
    [canSend, handleSend, sending]
  );

  return (
    <div className="space-y-4" onKeyDown={onKeyDown}>
      <h3 className="text-sm font-semibold">{t("system.sendAlert", "Wyślij alert systemowy")}</h3>

      <div className="space-y-2">
        <label htmlFor="alert-target" className="text-xs text-gray-600">
          {t("system.target", "Odbiorca")}
        </label>
        <Input
          id="alert-target"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder={t("system.targetPh", "all / userId / rola")}
          list="alert-target-presets"
        />
        <datalist id="alert-target-presets">
          <option value="all" />
          <option value="providers" />
          <option value="clients" />
          <option value="admins" />
        </datalist>
      </div>

      <div className="space-y-2">
        <label htmlFor="alert-message" className="text-xs text-gray-600">
          {t("system.message", "Treść alertu")}
        </label>
        <Textarea
          id="alert-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("system.messagePh", "Treść alertu (UI toast, SMS, email)")}
          rows={4}
          aria-describedby="alert-hint"
        />
        <div id="alert-hint" className="text-[11px] text-gray-500">
          {t("system.hint", "Wciśnij ⌘/Ctrl + Enter aby wysłać")}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleSend} disabled={sending || !canSend} aria-busy={sending ? "true" : "false"}>
          {sending ? t("system.sending", "Wysyłanie...") : t("system.send", "Wyślij alert")}
        </Button>
        {lastAlert && (lastAlert.id || lastAlert.undoUrl) && (
          <Button variant="outline" onClick={() => cancelAlert(lastAlert)}>
            {t("common.undo", "Cofnij")}
          </Button>
        )}
      </div>
    </div>
  );
}
