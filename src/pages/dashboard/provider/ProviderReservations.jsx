import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";

const ProviderReservations = () => {
  const navigate = useNavigate();
  const { authUser, token } = useAuth();
  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;
  const ui = useMemo(
    () => ({
      page: `p-4 max-w-5xl mx-auto space-y-4 ${theme?.classes?.page || ""}`.trim(),
      card: `border p-4 rounded-xl shadow-sm bg-white dark:bg-neutral-900 ${theme?.classes?.card || ""}`.trim(),
      muted: `text-sm text-gray-600 ${theme?.classes?.mutedText || ""}`.trim(),
      status: `text-sm text-gray-500 ${theme?.classes?.status || ""}`.trim(),
      btnOutline: `btn btn-sm btn-outline ${theme?.classes?.button || ""}`.trim(),
    }),
    [theme]
  );

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("from_desc");
  const revokeRef = useRef(null);

  const authHeader = useMemo(() => {
    const tkn =
      token ||
      authUser?.token ||
      (typeof window !== "undefined" ? window.localStorage.getItem("token") : null);
    return tkn ? { Authorization: `Bearer ${tkn}` } : {};
  }, [token, authUser?.token]);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError("");
    const ctrl = new AbortController();
    try {
      const res = await axios.get("/api/reservations/provider", {
        headers: authHeader,
        signal: ctrl.signal,
      });
      setReservations(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      if (!axios.isCancel(e)) {
        setError(t("reservations.fetchError", "Błąd pobierania rezerwacji"));
        toast.error(t("reservations.fetchError", "Błąd pobierania rezerwacji"));
      }
    } finally {
      setLoading(false);
    }
    return () => ctrl.abort();
  }, [authHeader, t]);

  useEffect(() => {
    if (!authUser) {
      navigate("/login");
      return;
    }
    const abortFetch = fetchReservations();
    return () => {
      if (typeof abortFetch === "function") abortFetch();
      if (revokeRef.current) {
        URL.revokeObjectURL(revokeRef.current);
        revokeRef.current = null;
      }
    };
  }, [authUser, navigate, fetchReservations]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = reservations.filter((r) => {
      const matchQ =
        !q ||
        String(r.clientName || "").toLowerCase().includes(q) ||
        String(r._id || "").toLowerCase().includes(q);
      const matchS = status === "all" || String(r.status || "").toLowerCase() === status;
      return matchQ && matchS;
    });
    const sorter = {
      from_desc: (a, b) => new Date(b.dateFrom || 0) - new Date(a.dateFrom || 0),
      from_asc: (a, b) => new Date(a.dateFrom || 0) - new Date(b.dateFrom || 0),
      to_desc: (a, b) => new Date(b.dateTo || 0) - new Date(a.dateTo || 0),
      to_asc: (a, b) => new Date(a.dateTo || 0) - new Date(b.dateTo || 0),
      created_desc: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      created_asc: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
    }[sort];
    return sorter ? list.sort(sorter) : list;
  }, [reservations, query, status, sort]);

  const sendReminder = useCallback(
    async (id) => {
      const tid = `remind_${id}`;
      try {
        toast.loading(t("reservations.reminding", "Wysyłam przypomnienie..."), { id: tid });
        await axios.post(`/api/reservations/${id}/remind`, null, { headers: authHeader });
        toast.success(t("reservations.reminded", "Przypomnienie wysłane"), { id: tid });
      } catch {
        toast.error(t("reservations.remindFail", "Błąd wysyłania przypomnienia"), { id: tid });
      }
    },
    [authHeader, t]
  );

  const downloadAneks = useCallback(
    async (id) => {
      try {
        const res = await axios.get(`/api/reservations/${id}/aneks`, {
          responseType: "blob",
          headers: authHeader,
        });
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        revokeRef.current = url;
        const a = document.createElement("a");
        a.href = url;
        a.download = `aneks_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success(t("reservations.annexDownloaded", "Pobrano aneks PDF"));
      } catch {
        toast.error(t("reservations.annexFail", "Błąd pobierania aneksu"));
      }
    },
    [authHeader, t]
  );

  if (!authUser) return null;

  return (
    <section className={ui.page} data-screen="provider-reservations" data-theme={dataTheme}>
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold mb-1">📅 {t("reservations.title", "Rezerwacje klientów")}</h2>
          <p className={ui.muted} aria-live="polite">
            {loading
              ? t("common.loading", "Ładowanie...")
              : error
              ? t("common.error", "Wystąpił błąd")
              : t("reservations.count", `Liczba: ${filtered.length}`)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("reservations.searchPlaceholder", "Szukaj po kliencie/ID")}
            aria-label={t("reservations.searchAria", "Wyszukaj rezerwacje")}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded border"
            aria-label={t("reservations.statusFilterAria", "Filtr statusu")}
          >
            <option value="all">{t("status.all", "Wszystkie")}</option>
            <option value="pending">{t("status.pending", "Oczekujące")}</option>
            <option value="confirmed">{t("status.confirmed", "Potwierdzone")}</option>
            <option value="cancelled">{t("status.cancelled", "Anulowane")}</option>
            <option value="completed">{t("status.completed", "Zrealizowane")}</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded border"
            aria-label={t("reservations.sortAria", "Sortowanie")}
          >
            <option value="from_desc">{t("sort.newestFrom", "Start ↓")}</option>
            <option value="from_asc">{t("sort.oldestFrom", "Start ↑")}</option>
            <option value="to_desc">{t("sort.newestTo", "Koniec ↓")}</option>
            <option value="to_asc">{t("sort.oldestTo", "Koniec ↑")}</option>
            <option value="created_desc">{t("sort.createdDesc", "Utworzone ↓")}</option>
            <option value="created_asc">{t("sort.createdAsc", "Utworzone ↑")}</option>
          </select>
          <Button onClick={fetchReservations} aria-label={t("common.refresh", "Odśwież")}>
            {t("common.refresh", "Odśwież")}
          </Button>
        </div>
      </header>

      {loading && (
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className={ui.muted}>{t("reservations.empty", "Brak rezerwacji.")}</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className="space-y-4">
          {filtered.map((r) => (
            <li key={r._id} className={ui.card}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{r.clientName || t("common.unknown", "Nieznany klient")}</span>
                <span className={ui.status}>{r.status || t("common.none", "brak")}</span>
              </div>
              <p className="text-sm text-gray-700">
                {r.dateFrom ? format(new Date(r.dateFrom), "dd.MM.yyyy") : "—"} –{" "}
                {r.dateTo ? format(new Date(r.dateTo), "dd.MM.yyyy") : "—"}
              </p>
              <div className="flex gap-3 mt-3">
                <Button onClick={() => sendReminder(r._id)} aria-label={t("reservations.remind", "Przypomnij")}>
                  🔔 {t("reservations.remind", "Przypomnij")}
                </Button>
                <Button onClick={() => downloadAneks(r._id)} aria-label={t("reservations.annex", "Aneks PDF")}>
                  📎 {t("reservations.annex", "Aneks PDF")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ProviderReservations;
