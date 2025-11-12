// src/pages/Offers.jsx – zintegrowany z GET /api/offer
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;

  const ui = useMemo(
    () => ({
      page: `p-6 space-y-4 ${theme?.classes?.page || ""}`.trim(),
      title: "text-xl font-bold",
      card: `p-4 border rounded bg-white ${theme?.classes?.card || ""}`.trim(),
      muted: `text-gray-500 ${theme?.classes?.mutedText || ""}`.trim(),
      badge: "inline-flex items-center px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700",
    }),
    [theme]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await axios.get("/api/offer", { signal: ctrl.signal });
        setOffers(Array.isArray(res.data) ? res.data : []);
        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
          navigator.sendBeacon(
            "/api/audit/event",
            new Blob([JSON.stringify({ type: "offers_list_view", count: (res.data || []).length, ts: Date.now() })], {
              type: "application/json",
            })
          );
        }
      } catch (e) {
        if (!axios.isCancel(e)) {
          setErr(t("offers.fetchError", "Błąd pobierania ofert"));
          toast.error(t("offers.fetchError", "Błąd pobierania ofert"));
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [t]);

  if (loading) return <div className="p-6" aria-live="polite">{t("common.loading", "Ładowanie...")}</div>;
  if (err) return <div className="p-6 text-red-600" role="alert">{err}</div>;

  return (
    <div className={ui.page} data-screen="offers" data-theme={dataTheme}>
      <h2 className={ui.title}>{t("offers.all", "Wszystkie oferty")}</h2>
      {offers.length === 0 ? (
        <p className={ui.muted}>{t("offers.empty", "Brak ofert.")}</p>
      ) : (
        offers.map((offer) => (
          <div key={offer._id || offer.id} className={ui.card}>
            <h3 className="font-semibold">{offer.title}</h3>
            <p className={ui.muted}>{offer.description}</p>
            <span className={ui.badge}>
              {t("offers.status", "Status")}: {offer.status ?? "—"}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default Offers;
