// src/pages/offers/OfferList.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { listOffers } from "@/api/offersApi.js";
import { useFilters } from "@/hooks/useFilters.js";
import OfferFilters from "@/components/OfferFilters.jsx";
import OfferCard from "@/components/OfferCard.jsx";
import SortDropdown from "@/components/Offers/SortDropdown.tsx";

const POLL_MS = 15000; // auto-refresh co 15s

const OfferList = () => {
  const { authUser } = useAuth();
  const live = useLiveText();
  const t = useCallback(
    (k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k),
    [live]
  );

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;
  const ui = useMemo(
    () => ({
      page: `space-y-4 p-4 max-w-5xl mx-auto ${theme?.classes?.page || ""}`.trim(),
      card: `flex justify-between items-center border p-3 rounded ${theme?.classes?.card || ""}`.trim(),
      btnDanger: `bg-red-500 text-white px-3 py-1.5 rounded ${theme?.classes?.dangerButton || ""}`.trim(),
      btn: `px-3 py-2 rounded border ${theme?.classes?.button || ""}`.trim(),
      controls: "flex flex-wrap gap-2 items-center justify-between",
      muted: `text-sm text-gray-600 ${theme?.classes?.mutedText || ""}`.trim(),
      pagerBtn: "px-3 py-1.5 border rounded disabled:opacity-50",
      pill: "px-2 py-0.5 rounded text-xs border",
      actionsWrap: "flex items-center gap-8",
      lifecycleWrap: "flex items-center gap-2",
      lifecycleBtn: "px-2 py-1 rounded border text-xs",
      statusDot: "inline-block w-2 h-2 rounded-full mr-1 align-middle",
    }),
    [theme]
  );

  // --- FILTRY (server-side)
  const { filters, setFilters, setFilter, setSort, setPage, toggleTag, clearTags, apiParams } =
    useFilters({
      q: "",
      sort: "-updatedAt",
      page: 1,
      limit: 20,
      onlyPublished: true,
    });

  const [offers, setOffers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const deleteTimerRef = useRef(null);
  const pollRef = useRef(null);
  const lastHashRef = useRef("");

  const computeHash = (list) => {
    try {
      return JSON.stringify(list.map((o) => [o._id || o.id, o.updatedAt || o.createdAt || 0, o.status || ""]));
    } catch {
      return "";
    }
  };

  const fetchOffers = useCallback(async () => {
    setError("");
    try {
      const { items, total: tot } = await listOffers(apiParams);
      const nextHash = computeHash(items);
      if (nextHash !== lastHashRef.current) {
        setOffers(items);
        setTotal(tot);
        lastHashRef.current = nextHash;
      }
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon(
          "/api/audit/event",
          new Blob(
            [JSON.stringify({ type: "offer_list_view", count: items.length, ts: Date.now() })],
            { type: "application/json" }
          )
        );
      }
    } catch {
      if (offers.length === 0) {
        const fallback = [
          { id: "DEMO-1", title: "Wózek widłowy – demo", createdAt: Date.now() - 86400000 },
          { id: "DEMO-2", title: "Agregat prądotwórczy – demo", createdAt: Date.now() - 3600000 },
          { id: "DEMO-3", title: "Podnośnik koszowy – demo", createdAt: Date.now() - 600000 },
        ];
        setOffers(fallback);
        setTotal(fallback.length);
        lastHashRef.current = computeHash(fallback);
        toast.success(t("offers.offlineFallback", "Tryb offline: wczytano dane przykładowe"));
      } else {
        setError(t("common.error", "Wystąpił błąd"));
      }
    } finally {
      setLoading(false);
    }
  }, [apiParams, offers.length, t]);

  // start/stop auto-poll
  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(() => {
      if (document.hidden) return; // pauza w tle
      fetchOffers();
    }, POLL_MS);
  }, [fetchOffers]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // pierwsze załadowanie + refetch na zmiany filtrów
  useEffect(() => {
    setLoading(true);
    fetchOffers();
  }, [fetchOffers, apiParams.q, apiParams.sort, apiParams.page, apiParams.limit, apiParams.onlyPublished]);

  // fast refresh na focus/online + polling
  useEffect(() => {
    const onFocus = () => fetchOffers();
    const onOnline = onFocus;
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);
    startPolling();
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
      stopPolling();
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
        deleteTimerRef.current = null;
      }
    };
  }, [fetchOffers, startPolling, stopPolling]);

  // --- mapowanie UI → sort param
  const uiSort = useMemo(() => {
    const s = filters.sort || "-updatedAt";
    if (s === "-updatedAt" || s === "-createdAt") return "created_desc";
    if (s === "createdAt" || s === "updatedAt") return "created_asc";
    if (s === "title") return "title_asc";
    if (s === "-title") return "title_desc";
    if (s === "price") return "price_asc";
    if (s === "-price") return "price_desc";
    return "created_desc";
  }, [filters.sort]);

  const onSortChange = (value) => {
    const map = {
      created_desc: "-updatedAt",
      created_asc: "updatedAt",
      title_asc: "title",
      title_desc: "-title",
      price_asc: "price",
      price_desc: "-price",
    };
    setSort(map[value] || "-updatedAt");
    setPage(1);
  };

  // DELETE (undo + beacon + refetch)
  const handleDelete = useCallback(
    (offer) => {
      const snapshot = [...offers];
      setOffers((prev) => prev.filter((o) => (o._id || o.id) !== (offer._id || offer.id)));

      const undo = () => {
        if (deleteTimerRef.current) {
          clearTimeout(deleteTimerRef.current);
          deleteTimerRef.current = null;
        }
        setOffers(snapshot);
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
          await axios.delete(`/api/offer/${offer._id || offer.id}`);
          if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
            navigator.sendBeacon(
              "/api/audit/event",
              new Blob(
                [JSON.stringify({ type: "offer_deleted", id: offer._id || offer.id, ts: Date.now() })],
                { type: "application/json" }
              )
            );
          }
          fetchOffers();
        } catch {
          setOffers(snapshot);
          toast.error(t("offers.deleteFailed", "Nie udało się usunąć — przywrócono"));
        } finally {
          if (toastId) toast.dismiss(toastId);
          deleteTimerRef.current = null;
        }
      }, 5000);
    },
    [offers, t, ui.btn, fetchOffers]
  );

  // CSV (przywrócone)
  const handleExportCSV = useCallback(() => {
    const rows = [
      [t("csv.id", "ID"), t("csv.title", "Tytuł"), t("csv.created", "Utworzono")],
      ...offers.map((o) => [
        o._id || o.id || "",
        String(o.title || o.name || "").replaceAll("\n", " ").trim(),
        o.createdAt ? new Date(o.createdAt).toISOString() : "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll(`"`, `""`)}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "offers.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [offers, t]);

  // --- LIFECYCLE (publish/unpublish/archive)
  const handleLifecycle = useCallback(
    async (offer, action) => {
      const id = offer._id || offer.id;
      try {
        await axios.patch(`/api/offer/${id}/${action}`);
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
    [fetchOffers, t]
  );

  // --- Paginacja
  const totalPages = Math.max(1, Math.ceil(total / (filters.limit || 20)));
  const canPrev = filters.page > 1;
  const canNext = filters.page < totalPages;

  // pomocnicze: kolor/status
  const StatusBadge = ({ status }) => {
    const color =
      status === "published"
        ? "bg-green-500"
        : status === "archived"
        ? "bg-gray-400"
        : "bg-yellow-500"; // unlisted / inne
    return (
      <span className={ui.pill}>
        <span className={`${ui.statusDot} ${color}`} />
        {status || "—"}
      </span>
    );
  };
  StatusBadge.propTypes = { status: PropTypes.string };

  return (
    <section className={ui.page} data-screen="offer-list" data-theme={dataTheme}>
      {/* PANEL FILTRÓW – 1:1 z BE */}
      <OfferFilters
        filters={filters}
        setFilters={setFilters}
        setFilter={setFilter}
        setPage={setPage}
        toggleTag={toggleTag}
        clearTags={clearTags}
        className="mb-3"
      />

      <header className={ui.controls}>
        <div className="flex items-center gap-2">
          <Input
            type="search"
            value={filters.q}
            onChange={(e) => {
              setFilter("q", e.target.value);
              setPage(1);
            }}
            placeholder={t("offers.searchPlaceholder", "Szukaj po tytule/ID")}
            aria-label={t("offers.searchAria", "Wyszukaj oferty")}
          />

          {/* ⬇️ Sort dropdown */}
          <SortDropdown
            value={
              uiSort === "created_desc"
                ? "-updatedAt"
                : uiSort === "created_asc"
                ? "updatedAt"
                : uiSort === "title_asc"
                ? "title"
                : uiSort === "title_desc"
                ? "-title"
                : uiSort === "price_asc"
                ? "price"
                : uiSort === "price_desc"
                ? "-price"
                : "-updatedAt"
            }
            onChange={(v) => {
              const map = {
                "-updatedAt": "created_desc",
                updatedAt: "created_asc",
                title: "title_asc",
                "-title": "title_desc",
                price: "price_asc",
                "-price": "price_desc",
              };
              onSortChange(map[v] || "created_desc");
            }}
            className={ui.btn}
          />
        </div>

        <div className="flex gap-2">
          <Button className={ui.btn} onClick={() => fetchOffers()} aria-label={t("common.refresh", "Odśwież")}>
            {t("common.refresh", "Odśwież")}
          </Button>
          <Button className={ui.btn} onClick={handleExportCSV} aria-label={t("common.exportCsv", "Eksportuj CSV")}>
            {t("common.exportCsv", "Eksport CSV")}
          </Button>
        </div>
      </header>

      <div className="flex items-center justify-between">
        <p className={ui.muted} aria-live="polite">
          {loading
            ? t("common.loading", "Ładowanie...")
            : error
            ? t("common.error", "Wystąpił błąd")
            : t("offers.count", `Liczba ofert: ${total}`)}
        </p>

        <div className="flex items-center gap-2">
          <button className={ui.pagerBtn} onClick={() => setPage(filters.page - 1)} disabled={!canPrev}>
            {t("common.prev", "Wstecz")}
          </button>
          <span className={ui.muted}>
            {t("common.page", "Strona")} {filters.page} / {totalPages}
          </span>
          <button className={ui.pagerBtn} onClick={() => setPage(filters.page + 1)} disabled={!canNext}>
            {t("common.next", "Dalej")}
          </button>
        </div>
      </div>

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

      {!loading && !error && offers.length === 0 && (
        <p className={ui.muted}>{t("offers.empty", "Brak ofert.")}</p>
      )}

      {!loading && !error && offers.length > 0 && (
        <div className="space-y-3">
          {offers.map((o) => {
            const id = o._id || o.id;
            const status = o.status || "unlisted";
            return (
              <div key={id} className={ui.card}>
                <div className="truncate max-w-[70%]">
                  <OfferCard offer={o} className="p-0 shadow-none border-0" />
                  <div className="mt-1">
                    <StatusBadge status={status} />
                  </div>
                </div>

                <div className={ui.actionsWrap}>
                  {/* Lifecycle */}
                  {authUser && (
                    <div className={ui.lifecycleWrap}>
                      {status !== "published" && (
                        <button
                          onClick={() => handleLifecycle(o, "publish")}
                          className={ui.lifecycleBtn}
                          aria-label={t("offers.publish", "Publikuj")}
                        >
                          {t("offers.publish", "Publikuj")}
                        </button>
                      )}
                      {status === "published" && (
                        <button
                          onClick={() => handleLifecycle(o, "unpublish")}
                          className={ui.lifecycleBtn}
                          aria-label={t("offers.unpublish", "Ukryj")}
                        >
                          {t("offers.unpublish", "Ukryj")}
                        </button>
                      )}
                      <button
                        onClick={() => handleLifecycle(o, "archive")}
                        className={ui.lifecycleBtn}
                        aria-label={t("offers.archive", "Archiwizuj")}
                      >
                        {t("offers.archive", "Archiwizuj")}
                      </button>
                    </div>
                  )}

                  {/* Delete */}
                  {authUser && (
                    <button
                      onClick={() => handleDelete(o)}
                      className={ui.btnDanger}
                      aria-label={t("common.delete", "Usuń ofertę")}
                    >
                      {t("common.delete", "Usuń")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default OfferList;
