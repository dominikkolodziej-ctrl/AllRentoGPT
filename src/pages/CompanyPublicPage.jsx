// src/pages/CompanyPublicPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getCompanyById } from "@/api/companyApi";
import { listOffers } from "@/api/offersApi.js";
import OfferCard from "@/components/OfferCard.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";

const CompanyPublicPage = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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
      page: `p-6 max-w-6xl mx-auto ${theme?.classes?.page || ""}`.trim(),
      title: "text-2xl font-bold",
      subtitle: "text-gray-700",
      desc: "text-gray-600",
      small: "text-sm text-gray-500",
      grid: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4",
    }),
    [theme]
  );

  const fetchCompany = useCallback(
    async (cid, ctrl) => {
      const data = await getCompanyById(cid, { signal: ctrl?.signal });
      setCompany(data);
    },
    []
  );

  // ⬇️ Bez nieużywanego _ctrl
  const fetchCompanyOffers = useCallback(
    async (cid) => {
      const { items } = await listOffers({});
      const filtered = Array.isArray(items)
        ? items.filter(
            (o) =>
              String(o.companyId || o.company?.id || o.company?._id) === String(cid)
          )
        : [];
      setOffers(filtered);
    },
    []
  );

  useEffect(() => {
    let active = true;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        // ⬇️ dopasowane wywołanie (bez ctrl w fetchCompanyOffers)
        await Promise.all([fetchCompany(id, ctrl), fetchCompanyOffers(id)]);
        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
          navigator.sendBeacon(
            "/api/audit/event",
            new Blob([JSON.stringify({ type: "company_public_view", id, ts: Date.now() })], {
              type: "application/json",
            })
          );
        }
      } catch {
        if (active) {
          const msg = t("company.loadError", "Błąd ładowania danych firmy");
          setErr(msg);
          toast.error(msg);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      ctrl.abort();
    };
  }, [id, fetchCompany, fetchCompanyOffers, t]);

  if (loading)
    return (
      <div className={ui.page} data-screen="company-public" data-theme={dataTheme}>
        <div className="p-6" aria-live="polite">
          {t("common.loading", "Ładowanie firmy...")}
        </div>
      </div>
    );

  if (err)
    return (
      <div className={ui.page} data-screen="company-public" data-theme={dataTheme}>
        <div className="p-6 text-red-600" role="alert">
          {err}
        </div>
      </div>
    );

  if (!company)
    return (
      <div className={ui.page} data-screen="company-public" data-theme={dataTheme}>
        <div className="p-6">{t("company.notFound", "Nie znaleziono firmy.")}</div>
      </div>
    );

  return (
    <div className={ui.page} data-screen="company-public" data-theme={dataTheme}>
      <div className="mb-6">
        <h1 className={ui.title}>
          {company.name || company.companyName || t("company.untitled", "Firma")}
        </h1>
        <p className={ui.subtitle}>
          {t("company.nip", "NIP")}: {company.nip || "—"}
        </p>
        <p className={ui.desc}>{company.description || "—"}</p>
        <p className={ui.small}>{company.address || "—"}</p>
      </div>

      <h2 className="text-xl font-semibold mb-4">
        {t("company.offersTitle", "Oferty tej firmy")}
      </h2>
      <div className={ui.grid}>
        {offers.length === 0 && (
          <p className="col-span-full">{t("company.noOffers", "Brak ofert.")}</p>
        )}
        {offers.map((offer) => (
          <OfferCard key={offer._id || offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
};

export default CompanyPublicPage;
