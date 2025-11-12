// Ścieżka: src/components/admin/CTRAlertTriggerButton.tsx
import React, { useState, useContext } from "react";
import { useLiveText } from "@/components/LiveTextCMS/useLiveText.js"; // ✅ FAZA 1
import { ThemeContext } from "@/context/ThemeContext.jsx"; // ✅ FAZA 10

export default function CTRAlertTriggerButton() {
  const { t } = useLiveText() as ReturnType<typeof useLiveText>; // ✅ typowanie zgodne z funkcją
  const { theme } = useContext(ThemeContext);
  const [status, setStatus] = useState<string>("");

  const runCheck = async () => {
    try {
      const res = await fetch("/api/admin/test-ctr-alert", { method: "POST" }); // ✅ FAZA 8
      const data = await res.json();
      setStatus(data.status ?? (t("admin.ctr.ready") || "Gotowe")); // ✅ nawiasy dodane
    } catch {
      setStatus(t("admin.ctr.error") || "Błąd połączenia z serwerem");
    }
  };

  return (
    <div className={`border p-3 rounded shadow-sm ${theme.bgCard} ${theme.textPrimary}`}> {/* ✅ FAZA 9 */}
      <h3 className="font-medium mb-2">
        {t("admin.ctr.title") || "Test alertów CTR"}
      </h3>
      <button
        onClick={runCheck}
        className={`${theme.bgButton} text-white px-3 py-1 rounded text-sm`} // ✅ FAZA 9
      >
        {t("admin.ctr.trigger") || "Uruchom ręcznie"}
      </button>
      {status && <p className="text-xs mt-2 text-gray-600">{status}</p>}
    </div>
  );
}
