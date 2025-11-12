// Ścieżka: src/components/admin/ExportDataPanel.jsx
import React, { useState, useContext } from "react";
import { useLiveText } from "@/components/LiveTextCMS/useLiveText.js"; // ✅ FAZA 1
import { ThemeContext } from "@/context/ThemeContext.jsx"; // ✅ FAZA 9

export default function ExportDataPanel() {
  const { t } = useLiveText(); // ✅ bez TypeScripta
  const { theme } = useContext(ThemeContext);

  const [token, setToken] = useState("");
  const [format, setFormat] = useState("json");

  const handleExport = () => {
    window.open(`/api/export/reservations?token=${token}&format=${format}`, "_blank");
  };

  return (
    <div className={`p-4 border rounded shadow-sm space-y-3 ${theme.bgCard} ${theme.textPrimary}`}>
      <h3 className="text-lg font-medium">
        {t("admin.export.title") || "Eksport rezerwacji (CRM)"}
      </h3>
      <input
        className="w-full border px-2 py-1 rounded"
        placeholder={t("admin.export.tokenPlaceholder") || "Wklej token dostępu"}
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value)}
        className="border px-2 py-1 rounded"
      >
        <option value="json">{t("admin.export.json") || "JSON"}</option>
        <option value="csv">{t("admin.export.csv") || "CSV"}</option>
      </select>
      <button
        onClick={handleExport}
        className={`${theme.bgButton} text-white px-4 py-1 rounded text-sm`}
      >
        {t("admin.export.download") || "Pobierz dane"}
      </button>
    </div>
  );
}
