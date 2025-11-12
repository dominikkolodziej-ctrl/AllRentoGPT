// 📍 src/components/admin/AuditLog.jsx
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table.jsx";
import { useLiveText } from "@/components/LiveTextCMS/useLiveText.js"; // ✅ FAZA 1
import { useTheme } from "@/context/ThemeContext.jsx"; // ✅ FAZA 9

export default function AuditLog() {
  const { t } = useLiveText("admin");
  const { theme } = useTheme(); // ✅ FAZA 9

  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(false); // ✅ FAZA 10

  useEffect(() => {
    fetch("/api/system/audit")
      .then((res) => res.json())
      .then(setLogs)
      .catch(() => {
        setError(true);
        setLogs([]);
      });
  }, []);

  return (
    <div className={`border rounded-xl p-4 shadow-sm ${theme.bgCard} ${theme.textPrimary}`}> {/* ✅ FAZA 9 */}
      <h3 className="text-sm font-semibold mb-4">{t("audit.title", "Dziennik operacji systemowych")}</h3>

      {error && (
        <div className="text-red-500 text-sm mb-3">
          {t("audit.error", "Nie udało się pobrać logów systemowych.")}
        </div>
      )}

      <div className="overflow-auto max-h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("audit.user", "Użytkownik")}</TableHead>
              <TableHead>{t("audit.action", "Akcja")}</TableHead>
              <TableHead>{t("audit.module", "Moduł")}</TableHead>
              <TableHead>{t("audit.date", "Data")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log, i) => (
              <TableRow key={i}>
                <TableCell>{log.user || t("audit.system", "System")}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.module}</TableCell>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
