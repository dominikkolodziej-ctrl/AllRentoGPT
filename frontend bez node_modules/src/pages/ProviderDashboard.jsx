// src/pages/ProviderDashboard.jsx – wersja z ExportDataPanel
import React, { useCallback, useEffect, useMemo } from "react";
import ExportDataPanel from "@/components/Export/ExportDataPanel.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";

const ProviderDashboard = () => {
  const theme = useTheme?.();
  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;

  const ui = useMemo(
    () => ({
      page: `p-6 ${theme?.classes?.page || ""}`.trim(),
      title: "text-2xl font-bold mb-4",
      card: `p-4 bg-white rounded shadow ${theme?.classes?.card || ""}`.trim(),
    }),
    [theme]
  );

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "provider_dashboard_view", ts: Date.now() })], {
          type: "application/json",
        })
      );
    }
  }, []);

  return (
    <div className={ui.page} data-screen="provider-dashboard" data-theme={dataTheme}>
      <h1 className={ui.title}>{t("provider.panelTitle", "Panel dostawcy")}</h1>
      <div className="space-y-4">
        <div className={ui.card}>{t("provider.widgetA", "Widget A")}</div>
        <div className={ui.card}>{t("provider.widgetB", "Widget B")}</div>
        <ExportDataPanel />
      </div>
    </div>
  );
};

export default ProviderDashboard;
