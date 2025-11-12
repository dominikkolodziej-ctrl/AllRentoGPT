// src/pages/dashboard/provider/ProviderOffers.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import { listOffers } from "@/api/offersApi.js";

const ProviderOffers = () => {
  const { authUser, token } = useAuth();
  const navigate = useNavigate();
  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;

  const ui = useMemo(
    () => ({
      page: `p-4 space-y-4 ${theme?.classes?.page || ""}`.trim(),
      card: `rounded border p-4 space-y-2 ${theme?.classes?.card || ""}`.trim(),
      btn: `px-3 py-1.5 rounded border ${theme?.classes?.button || ""}`.trim(),
      select: `px-3 py-2 rounded border ${theme?.classes?.select || ""}`.trim(),
      muted: `text-sm text-gray-600 ${theme?.classes?.mutedText || ""}`.trim(),
      kpiWrap: "grid grid-cols-2 md:grid-cols-4 gap-2",
      kpiCard: "rounded border p-3 text-center",
      badge: (variant) =>
        `text-xs px-2 py-1 rounded ${
          variant === "draft" || variant === "unlisted"
            ? theme?.classes?.badgeDraft || "bg-yellow-100 text-yellow-800"
            : variant === "published"
            ? theme?.classes?.badgePublished || "bg-green-100 text-green-800"
            : variant === "archived"
            ? theme?.classes?.badgeArchived || "bg-gray-200 text-gray-700"
            : theme?.classes?.badge || "bg-blue-100 text-blue-800"
        }`,
      lifeBtn: "px-2 py-1 rounded border text-xs",
    }),
    [theme]
  );

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("created_desc");
  const deleteTimerRef = useRef(null);

  const authHeader = useMemo(() => {
    const tkn =
      token ||
      authUser?.token ||
      (typeof window !== "undefined" ? window.localStorage.getItem("token") : null);
    return tkn ? { Authorization: `Bearer ${tkn}` } : {};
  }, [token, authUser?.token]);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { items } = await listOffers({
        owner: authUser?._id || authUser?.id,
        limit: 200,
        sort: "-updatedAt",
      });
      const list = Array.isArray(items) ? items : [];
      setOffers(list);

      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon(
          "/api/audit/event",
          new Blob([JSON.stringify({ type: "offers_view", count: list.length, ts: Date.now() })], {
            type: "application/json",
          })
        );
      }
    } catch {
      setError(t("common.fetchError", "Błąd pobierania ofert"));
      toast.error(t("common.fetchError", "Błąd pobierania ofert"));
    } finally {
      setLoading(false);
    }
  }, [authUser?._id, authUser?.id, t]);

  useEffect(() => {
    if (!authUser?._id && !authUser?.id) return;
    fetchOffers();
    return () => {
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
        deleteTimerRef.current = null;
      }
    };
  }, [authUser?._id, authUser?.id, fetchOffers]);

  useEffect(() => {
    if (!authUser) navigate("/login");
  }, [authUser, navigate]);

  // KPI
  const kpi = useMemo(() => {
    const all = offers.length;
    const published = offers.filter((o) => (o.status || "").toLowerCase() === "published").length;
    const archived = offers.filter((o) => (o.status || "").toLowerCase() === "archived").length;
    const unlisted = offers.filter((o) => {
      const s = (o.status || "").toLowerCase();
      return s === "unlisted" || s === "draft";
    }).length;
    return { all, published, unlisted, archived };
  }, [offers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byQuery = (o) =>
      !q ||
      String(o.title || o.name || "").toLowerCase().includes(q) ||
      String(o.description || "").toLowerCase().includes(q) ||
      String(o._id || o.id || "").toLowerCase().includes(q);

    const byStatus = (o) => {
      if (status === "all") return true;
      const s = String(o.status || "").toLowerCase();
      if (status === "draft") return s === "draft" || s === "unlisted";
      return s === status;
    };

    const arr = offers.filter((o) => byQuery(o) && byStatus(o));

    const sorter =
      {
        created_desc: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        created_asc: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
        price_desc: (a, b) => (b.price || b.dailyRate || 0) - (a.price || a.dailyRate || 0),
        price_asc: (a, b) => (a.price || a.dailyRate || 0) - (b.price || b.dailyRate || 0),
        title_asc: (a, b) => String(a.title || a.name || "").localeCompare(String(b.title || b.name || "")),
        title_desc: (a, b) => String(b.title || b.name || "").localeCompare(String(a.title || a.name || "")),
      }[sort] || null;

    return sorter ? [...arr].sort(sorter) : arr;
  }, [offers, query, status, sort]);

  // Lifecycle: publish / unpublish / archive
  const handleLifecycle = useCallback(
    async (offer, action) => {
      const id = offer._id || offer.id;
      try {
        await axios.patch(`/api/offer/${id}/${action}`, null, { headers: authHeader });
        toast.success(
          action === "publish"
            ? t("offers.published", "Opublikowano")
            : action === "unpublish"
            ? t("offers.unpublished", "Ukryto")
            : t("offers.archived", "Zarchiwizowano")
        );
        fetchOffers();
        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
          navigator.sendBeacon(
            "/api/audit/event",
            new Blob([JSON.stringify({ type: `offer_${action}`, id, ts: Date.now() })], {
              type: "application/json",
            })
          );
        }
      } catch {
        toast.error(t("offers.lifecycleFailed", "Operacja nie powiodła się"));
      }
    },
    [authHeader, fetchOffers, t]
  );

  // Delete (undo w toast)
  const handleDelete = useCallback(
    (offer) => {
      const current = [...offers];
      setOffers((prev) => prev.filter((o) => (o._id || o.id) !== (offer._id || offer.id)));

      const undo = () => {
        if (deleteTimerRef.current) {
          clearTimeout(deleteTimerRef.current);
          deleteTimerRef.current = null;
        }
        setOffers(current);
        toast.success(t("offers.undoRestored", "Przywrócono ofertę"));
      };

      const toastId = toast.custom(
        (tctx) => (
          <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 rounded border px-3 py-2 shadow">
            <span>{t("offers.deleted", "Oferta usunięta")}</span>
            <button
              onClick={() => {
                toast.dismiss(tctx.id);
                undo();
              }}
              className={ui.btn}
              aria-label={t("common.undo", "Cofnij")}
            >
              {t("common.undo", "Cofnij")}
            </button>
          </div>
        ),
        { duration: 5000 }
      );

      deleteTimerRef.current = setTimeout(async () => {
        try {
          await axios.delete(`/api/offer/${offer._id || offer.id}`, { headers: authHeader });
          navigator.sendBeacon?.(
            "/api/audit/event",
            new Blob([JSON.stringify({ type: "offer_deleted", id: offer._id || offer.id, ts: Date.now() })], {
              type: "application/json",
            })
          );
        } catch {
          setOffers(current);
          toast.error(t("offers.deleteFailed", "Nie udało się usunąć — przywrócono"));
        } finally {
          if (toastId) toast.dismiss(toastId);
          deleteTimerRef.current = null;
        }
      }, 5000);
    },
    [offers, authHeader, t, ui.btn]
  );

  const handleEvaluate = useCallback(
    async (offerId) => {
      const tid = `eval_${offerId}`;
      try {
        toast.loading(t("ai.evaluating", "Oceniam ofertę..."), { id: tid });
        const res = await axios.post(
          "/api/ai/evaluate",
          { offerId },
          { headers: { ...authHeader, "Content-Type": "application/json" } }
        );
        toast.success(res?.data?.message || t("ai.done", "Ocena gotowa"), { id: tid });
      } catch {
        toast.error(t("ai.fail", "Nie udało się ocenić"), { id: tid });
      }
    },
    [authHeader, t]
  );

  const handleExportCSV = useCallback(() => {
    const rows = [
      [t("csv.id", "ID"), t("csv.title", "Tytuł"), t("csv.status", "Status"), t("csv.price", "Cena"), t("csv.currency", "Waluta"), t("csv.created", "Utworzono")],
      ...filtered.map((o) => [
        o._id || o.id || "",
        (o.title || o.name || "").replaceAll("\n", " ").trim(),
        o.status || "",
        o.price ?? o.dailyRate ?? "",
        o.currency || "PLN",
        o.createdAt ? format(new Date(o.createdAt), "yyyy-MM-dd HH:mm") : "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "provider_offers.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [filtered, t]);

  const handleRefresh = useCallback(() => fetchOffers(), [fetchOffers]);

  if (!authUser) return null;

  return (
    <section className={ui.page} data-screen="provider-offers" data-onboarding-id="provider-offers" data-theme={dataTheme}>
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("provider.offers.title", "🧾 Lista Twoich ofert — widok dostawcy")}
          </h1>
          <p className={ui.muted} aria-live="polite">
            {loading
              ? t("common.loading", "Ładowanie...")
              : error
              ? t("common.error", "Wystąpił błąd")
              : t("provider.offers.count", `Liczba ofert: ${filtered.length}`)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("provider.offers.searchPlaceholder", "Szukaj po tytule/opisie/ID")}
            aria-label={t("provider.offers.searchAria", "Wyszukaj oferty")}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={ui.select}
            aria-label={t("provider.offers.statusFilterAria", "Filtr statusu")}
          >
            <option value="all">{t("status.all", "Wszystkie")}</option>
            <option value="draft">{t("status.draft", "Szkic/Ukryte")}</option>
            <option value="published">{t("status.published", "Opublikowane")}</option>
            <option value="archived">{t("status.archived", "Zarchiwizowane")}</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className={ui.select}
            aria-label={t("provider.offers.sortAria", "Sortowanie")}
          >
            <option value="created_desc">{t("sort.newest", "Najnowsze")}</option>
            <option value="created_asc">{t("sort.oldest", "Najstarsze")}</option>
            <option value="price_desc">{t("sort.priceDesc", "Cena ↓")}</option>
            <option value="price_asc">{t("sort.priceAsc", "Cena ↑")}</option>
            <option value="title_asc">{t("sort.titleAsc", "Tytuł A–Z")}</option>
            <option value="title_desc">{t("sort.titleDesc", "Tytuł Z–A")}</option>
          </select>
          <Button onClick={handleRefresh} aria-label={t("common.refresh", "Odśwież")}>
            {t("common.refresh", "Odśwież")}
          </Button>
          <Button onClick={handleExportCSV} aria-label={t("common.exportCsv", "Eksportuj CSV")}>
            {t("common.exportCsv", "Eksport CSV")}
          </Button>
        </div>
      </header>

      {/* KPI */}
      {!loading && !error && (
        <div className={ui.kpiWrap}>
          <div className={ui.kpiCard}>
            <div className="text-xs opacity-70">{t("kpi.all", "Wszystkie")}</div>
            <div className="text-xl font-semibold">{kpi.all}</div>
          </div>
          <div className={ui.kpiCard}>
            <div className="text-xs opacity-70">{t("kpi.published", "Opublikowane")}</div>
            <div className="text-xl font-semibold">{kpi.published}</div>
          </div>
          <div className={ui.kpiCard}>
            <div className="text-xs opacity-70">{t("kpi.unlisted", "Ukryte/Szkic")}</div>
            <div className="text-xl font-semibold">{kpi.unlisted}</div>
          </div>
          <div className={ui.kpiCard}>
            <div className="text-xs opacity-70">{t("kpi.archived", "Zarchiwizowane")}</div>
            <div className="text-xl font-semibold">{kpi.archived}</div>
          </div>
        </div>
      )}

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
        <p className={ui.muted}>{t("provider.offers.empty", "Brak ofert spełniających kryteria.")}</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((o) => {
            const id = o._id || o.id;
            const statusVal = (o.status || "").toLowerCase();
            return (
              <li key={id} className={ui.card}>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold">
                    {o.title || o.name || t("common.noTitle", "Bez tytułu")}
                  </h2>
                  <span
                    className={ui.badge(statusVal)}
                    aria-label={`${t("common.status", "Status")}: ${o.status || t("common.none", "brak")}`}
                  >
                    {o.status || t("common.none", "brak")}
                  </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-3">{o.description || "–"}</p>

                <div className="text-sm text-gray-700 flex flex-wrap items-center gap-3">
                  <span>
                    {t("common.price", "Cena")}:{" "}
                    <strong>{o.price ?? o.dailyRate ?? "—"} {o.currency || "PLN"}</strong>
                  </span>
                  <span className="opacity-70">
                    {t("common.createdAt", "Utworzono")}: {o.createdAt ? format(new Date(o.createdAt), "yyyy-MM-dd HH:mm") : "—"}
                  </span>
                </div>

                {/* Akcje */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button onClick={() => navigate(`/dashboard/provider/offers/${id}/edit`)} aria-label={t("common.edit", "Edytuj ofertę")}>
                    {t("common.edit", "Edytuj")}
                  </Button>
                  <Button onClick={() => handleDelete(o)} aria-label={t("common.delete", "Usuń ofertę")}>
                    {t("common.delete", "Usuń")}
                  </Button>
                  <Button onClick={() => window.open(`/api/contracts/offer/${id}/pdf`, "_blank")} aria-label={t("common.pdfPreview", "Podgląd PDF umowy")}>
                    {t("common.pdf", "PDF")}
                  </Button>
                  <Button onClick={() => handleEvaluate(id)} aria-label={t("ai.score", "Ocena AI")}>
                    {t("ai.score", "AI Ocena")}
                  </Button>

                  {/* Lifecycle */}
                  {statusVal !== "published" && (
                    <button
                      type="button"
                      className={ui.lifeBtn}
                      onClick={() => handleLifecycle(o, "publish")}
                      aria-label={t("offers.publish", "Publikuj")}
                    >
                      {t("offers.publish", "Publikuj")}
                    </button>
                  )}
                  {statusVal === "published" && (
                    <button
                      type="button"
                      className={ui.lifeBtn}
                      onClick={() => handleLifecycle(o, "unpublish")}
                      aria-label={t("offers.unpublish", "Ukryj")}
                    >
                      {t("offers.unpublish", "Ukryj")}
                    </button>
                  )}
                  <button
                    type="button"
                    className={ui.lifeBtn}
                    onClick={() => handleLifecycle(o, "archive")}
                    aria-label={t("offers.archive", "Archiwizuj")}
                  >
                    {t("offers.archive", "Archiwizuj")}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default ProviderOffers;
