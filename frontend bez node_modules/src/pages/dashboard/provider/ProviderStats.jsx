import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAuth } from "@/context/AuthContext.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table.jsx";
import { Button } from "@/components/ui/button.jsx";

const ProviderStats = () => {
  const { authUser, token } = useAuth();
  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const theme = useTheme?.();
  const dataTheme = (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;
  const ui = useMemo(
    () => ({
      page: `p-4 max-w-5xl mx-auto space-y-6 ${theme?.classes?.page || ""}`.trim(),
      card: `mb-6 rounded border bg-white dark:bg-neutral-900 ${theme?.classes?.card || ""}`.trim(),
      muted: `text-sm text-gray-600 ${theme?.classes?.mutedText || ""}`.trim(),
      tableWrap: `overflow-x-auto ${theme?.classes?.tableWrap || ""}`.trim(),
      btn: `px-3 py-2 rounded border ${theme?.classes?.button || ""}`.trim(),
    }),
    [theme]
  );

  const [trend, setTrend] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const authHeader = useMemo(() => {
    const tkn =
      token ||
      authUser?.token ||
      (typeof window !== "undefined" ? window.localStorage.getItem("token") : null);
    return tkn ? { Authorization: `Bearer ${tkn}` } : {};
  }, [token, authUser?.token]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    const ctrl = new AbortController();
    try {
      const res = await axios.get("/api/stats/provider", { headers: authHeader, signal: ctrl.signal });
      const rawTrend = Array.isArray(res?.data?.trend) ? res.data.trend : [];
      const normTrend = rawTrend.map((d) => {
        const views = Number(d.views ?? d.impressions ?? 0);
        const clicks = Number(d.clicks ?? 0);
        const ctrVal = d.ctr != null ? Number(d.ctr) : views > 0 ? (clicks / views) * 100 : 0;
        return { day: d.day || d.date || "", ctr: Number.isFinite(ctrVal) ? Number(ctrVal.toFixed(2)) : 0 };
      });
      setTrend(normTrend);

      const rawOffers = Array.isArray(res?.data?.offers) ? res.data.offers : [];
      const normOffers = rawOffers.map((o) => {
        const views = Number(o.views ?? 0);
        const clicks = Number(o.clicks ?? 0);
        const ctrVal = o.ctr != null ? Number(o.ctr) : views > 0 ? (clicks / views) * 100 : 0;
        return {
          _id: o._id || o.id || "",
          title: o.title || o.name || t("common.noTitle", "Bez tytułu"),
          views,
          clicks,
          ctr: Number.isFinite(ctrVal) ? Number(ctrVal.toFixed(2)) : 0,
        };
      });
      setOffers(normOffers);
    } catch (e) {
      if (!axios.isCancel(e)) {
        setError(t("stats.fetchError", "Błąd pobierania statystyk"));
        toast.error(t("stats.fetchError", "Błąd pobierania statystyk"));
      }
    } finally {
      setLoading(false);
    }
    return () => ctrl.abort();
  }, [authHeader, t]);

  useEffect(() => {
    const doFetch = fetchStats();
    return () => {
      if (typeof doFetch === "function") doFetch();
    };
  }, [fetchStats]);

  const exportCSV = useCallback(() => {
    const rows = [
      [t("csv.offer", "Oferta"), t("csv.views", "Wyświetlenia"), t("csv.clicks", "Kliknięcia"), t("csv.ctr", "CTR %")],
      ...offers.map((o) => [o.title, o.views, o.clicks, o.ctr]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll(`"`, `""`)}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "provider_stats.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [offers, t]);

  return (
    <section className={ui.page} data-screen="provider-stats" data-theme={dataTheme}>
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">📈 {t("stats.title", "Statystyki Twojej firmy")}</h2>
          <p className={ui.muted} aria-live="polite">
            {loading ? t("common.loading", "Ładowanie...") : error ? t("common.error", "Wystąpił błąd") : t("stats.updated", "Zaktualizowano")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button className={ui.btn} onClick={fetchStats} aria-label={t("common.refresh", "Odśwież")}>
            {t("common.refresh", "Odśwież")}
          </Button>
          <Button className={ui.btn} onClick={exportCSV} aria-label={t("common.exportCsv", "Eksportuj CSV")}>
            {t("common.exportCsv", "Eksport CSV")}
          </Button>
        </div>
      </header>

      <Card className={ui.card}>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">🔄 {t("stats.trendTitle", "Trend CTR (kliknięcia / wyświetlenia)")}</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <CartesianGrid strokeDasharray="5 5" />
                <Line type="monotone" dataKey="ctr" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className={ui.card}>
        <CardContent>
          <h3 className="text-lg font-semibold mb-2">📋 {t("stats.byOfferTitle", "CTR wg ogłoszeń")}</h3>
          <div className={ui.tableWrap}>
            <Table>
              <THead>
                <TR>
                  <TH>{t("table.offer", "Oferta")}</TH>
                  <TH>{t("table.views", "Wyświetlenia")}</TH>
                  <TH>{t("table.clicks", "Kliknięcia")}</TH>
                  <TH>{t("table.ctr", "CTR %")}</TH>
                </TR>
              </THead>
              <TBody>
                {offers.map((o) => (
                  <TR key={o._id}>
                    <TD>{o.title}</TD>
                    <TD>{o.views}</TD>
                    <TD>{o.clicks}</TD>
                    <TD>{o.ctr}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ProviderStats;
