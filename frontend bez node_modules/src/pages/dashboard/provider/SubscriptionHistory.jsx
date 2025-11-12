import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Loader } from "@/components/ui/loader.jsx";
import { Button } from "@/components/ui/button.jsx";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";

export default function SubscriptionHistory({ userId }) {
  const { token } = useAuth();
  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;
  const ui = useMemo(
    () => ({
      card: `max-w-5xl mx-auto mt-8 ${theme?.classes?.card || ""}`.trim(),
      header: `flex items-center justify-between gap-3 ${theme?.classes?.header || ""}`.trim(),
      btn: `px-3 py-2 rounded border ${theme?.classes?.button || ""}`.trim(),
      tableWrap: `overflow-x-auto ${theme?.classes?.tableWrap || ""}`.trim(),
    }),
    [theme]
  );

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const revokeRef = useRef(null);

  const authHeader = useMemo(() => {
    const tkn =
      token || (typeof window !== "undefined" ? window.localStorage.getItem("token") : null);
    return tkn ? { Authorization: `Bearer ${tkn}` } : {};
  }, [token]);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    const ctrl = new AbortController();
    try {
      const res = await axios.get(`/api/subscriptions/history/${userId}`, {
        headers: authHeader,
        signal: ctrl.signal,
      });
      setSubscriptions(Array.isArray(res.data) ? res.data : []);
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon(
          "/api/audit/event",
          new Blob(
            [JSON.stringify({ type: "subscriptions_view", count: (res.data || []).length, ts: Date.now() })],
            { type: "application/json" }
          )
        );
      }
    } catch (e) {
      if (!axios.isCancel(e)) {
        setError(t("subs.fetchError", "Błąd pobierania historii subskrypcji"));
        toast.error(t("subs.fetchError", "Błąd pobierania historii subskrypcji"));
      }
    } finally {
      setLoading(false);
    }
    return () => ctrl.abort();
  }, [userId, authHeader, t]);

  useEffect(() => {
    const abort = fetchHistory();
    return () => {
      if (typeof abort === "function") abort();
      if (revokeRef.current) {
        URL.revokeObjectURL(revokeRef.current);
        revokeRef.current = null;
      }
    };
  }, [fetchHistory]);

  const downloadPDF = useCallback(
    async (id) => {
      try {
        const res = await axios.get(`/api/invoices/${id}/pdf`, {
          responseType: "blob",
          headers: authHeader,
        });
        const blob = new Blob([res.data], { type: "application/pdf" });
        if (revokeRef.current) {
          URL.revokeObjectURL(revokeRef.current);
          revokeRef.current = null;
        }
        const url = URL.createObjectURL(blob);
        revokeRef.current = url;
        const a = document.createElement("a");
        a.href = url;
        a.download = `faktura_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success(t("subs.invoiceDownloaded", "Faktura pobrana"));
      } catch {
        toast.error(t("subs.invoiceDownloadError", "Błąd pobierania PDF"));
      }
    },
    [authHeader, t]
  );

  const exportCSV = useCallback(() => {
    const rows = [
      [t("csv.plan", "Plan"), t("csv.from", "Od"), t("csv.to", "Do"), t("csv.status", "Status")],
      ...subscriptions.map((s) => [
        s.plan ?? "",
        s.from ? format(new Date(s.from), "dd.MM.yyyy") : "",
        s.to ? format(new Date(s.to), "dd.MM.yyyy") : "",
        s.status ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll(`"`, `""`)}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscription_history.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [subscriptions, t]);

  return (
    <Card className={ui.card} data-screen="subscription-history" data-theme={dataTheme}>
      <CardContent>
        <div className={ui.header}>
          <h2 className="text-xl font-bold">📄 {t("subs.title", "Historia subskrypcji")}</h2>
          <div className="flex gap-2">
            <Button className={ui.btn} onClick={fetchHistory} aria-label={t("common.refresh", "Odśwież")}>
              {t("common.refresh", "Odśwież")}
            </Button>
            <Button className={ui.btn} onClick={exportCSV} aria-label={t("common.exportCsv", "Eksportuj CSV")}>
              {t("common.exportCsv", "Eksport CSV")}
            </Button>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div role="alert" className="text-red-600">
            {error}
          </div>
        ) : subscriptions.length === 0 ? (
          <p className="text-gray-600">{t("subs.empty", "Brak historii subskrypcji.")}</p>
        ) : (
          <div className={ui.tableWrap}>
            <Table>
              <THead>
                <TR>
                  <TH>{t("table.plan", "Plan")}</TH>
                  <TH>{t("table.from", "Od")}</TH>
                  <TH>{t("table.to", "Do")}</TH>
                  <TH>{t("table.status", "Status")}</TH>
                  <TH>{t("table.action", "Akcja")}</TH>
                </TR>
              </THead>
              <TBody>
                {subscriptions.map((s) => (
                  <TR key={s._id}>
                    <TD>{s.plan}</TD>
                    <TD>{s.from ? format(new Date(s.from), "dd.MM.yyyy") : "—"}</TD>
                    <TD>{s.to ? format(new Date(s.to), "dd.MM.yyyy") : "—"}</TD>
                    <TD>
                      <Badge>{s.status}</Badge>
                    </TD>
                    <TD>
                      <button
                        onClick={() => downloadPDF(s._id)}
                        className="text-blue-600 underline text-sm"
                        aria-label={t("subs.downloadInvoice", "Pobierz PDF")}
                      >
                        {t("subs.downloadInvoice", "Pobierz PDF")}
                      </button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

SubscriptionHistory.propTypes = {
  userId: PropTypes.string.isRequired,
};
