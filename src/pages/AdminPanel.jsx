import React, { useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext.jsx";
import { Navigate } from "react-router-dom";
import ContractArchiveTable from "@/modules/contract/ContractArchiveTable.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";

const AdminPanel = () => {
  const { authUser } = useAuth();
  const live = useLiveText();
  const t = (k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k);

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;
  const ui = useMemo(
    () => ({
      page: `max-w-7xl mx-auto p-6 space-y-6 ${theme?.classes?.page || ""}`.trim(),
      title: "text-3xl font-bold",
      subtitle: `text-gray-600 ${theme?.classes?.mutedText || ""}`.trim(),
    }),
    [theme]
  );

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([JSON.stringify({ type: "admin_panel_view", ts: Date.now() })], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/audit/event", blob);
    }
  }, []);

  if (!authUser || String(authUser.role).toLowerCase() !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div
      className={ui.page}
      data-screen="admin-panel"
      data-onboarding-id="admin-contracts"
      data-theme={dataTheme}
    >
      <h1 className={ui.title}>📄 {t("admin.contracts.title", "Archiwum Umów – Panel Administratora")}</h1>
      <p className={ui.subtitle}>
        {t(
          "admin.contracts.subtitle",
          "Lista wszystkich umów w systemie: filtrowanie, przeszukiwanie, eksport."
        )}
      </p>

      <ContractArchiveTable adminView />
    </div>
  );
};

export default AdminPanel;
