// src/pages/offers/OfferDetails.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail } from "lucide-react";
import { getOfferById, getOfferAvailability } from "@/api/offersApi.js";
import ReservationModal from "@/components/reservations/ReservationModal.jsx";
import DocumentSignaturePanel from "@/components/Document/DocumentSignaturePanel.tsx";
import OfferGallery from "@/components/OfferDetails/OfferGallery.jsx";
import OfferSpecsList from "@/components/OfferDetails/OfferSpecsList.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";

const OfferDetails = () => {
  const { id } = useParams();
  const [offer, setOffer] = useState(null);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unavailableDates, setUnavailableDates] = useState([]);

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
      page: `max-w-6xl mx-auto p-6 space-y-6 ${theme?.classes?.page || ""}`.trim(),
      sectionCard: `mt-6 p-4 bg-gray-50 dark:bg-neutral-900 rounded border ${
        theme?.classes?.card || ""
      }`.trim(),
      primaryBtn: `btn btn-primary ${theme?.classes?.button || ""}`.trim(),
      secondaryBtn: `btn btn-secondary ${theme?.classes?.button || ""}`.trim(),
      muted: `text-sm text-gray-500 ${theme?.classes?.mutedText || ""}`.trim(),
    }),
    [theme]
  );

  // Ładowanie oferty
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getOfferById(id);
        if (!active) return;
        setOffer(data);

        // telemetry (nie blokuje UI)
        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
          navigator.sendBeacon(
            "/api/audit/event",
            new Blob([JSON.stringify({ type: "offer_view", id, ts: Date.now() })], {
              type: "application/json",
            })
          );
        }
      } catch {
        toast.error(t("offer.loadError", "Nie udało się załadować oferty"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, t]);

  const offerId = offer?._id || offer?.id || id;

  // Ładowanie dostępności (ciche; jeśli 401/404 – pomijamy)
  useEffect(() => {
    if (!offerId) return;
    (async () => {
      try {
        const dates = await getOfferAvailability(offerId);
        if (Array.isArray(dates)) setUnavailableDates(dates);
      } catch {
        /* no-op: availability optional */
      }
    })();
  }, [offerId]);

  if (loading) {
    return (
      <div className={ui.page} data-screen="offer-details" data-theme={dataTheme}>
        <div className="text-center p-8" aria-live="polite">
          {t("common.loading", "Ładowanie oferty...")}
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className={ui.page} data-screen="offer-details" data-theme={dataTheme}>
        <div className="text-center p-8" role="alert">
          {t("offer.notFound", "Nie znaleziono oferty.")}
        </div>
      </div>
    );
  }

  const offerTitle = offer.title || t("common.noTitle", "Bez tytułu");

  return (
    <div className={ui.page} data-screen="offer-details" data-theme={dataTheme}>
      {/* Galeria zdjęć */}
      <OfferGallery images={Array.isArray(offer.images) ? offer.images : []} />

      {/* Nagłówek i opis */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-blue-700">{offerTitle}</h1>
        <p className="text-gray-600">
          {offer.description || t("offer.noDescription", "Brak opisu")}
        </p>

        {/* Szybkie akcje */}
        <div className="flex flex-wrap gap-4 mt-6">
          <button
            type="button"
            className={ui.primaryBtn}
            onClick={() => setReservationOpen(true)}
            aria-label={t("offer.reserve", "Zarezerwuj")}
          >
            {t("offer.reserve", "Zarezerwuj")}
          </button>
          <button
            type="button"
            className={`${ui.secondaryBtn} flex items-center gap-2`}
            onClick={() => {
              window.location.href = `/messages/new?offerId=${encodeURIComponent(offerId)}`;
            }}
            aria-label={t("offer.sendMessage", "Wyślij wiadomość")}
          >
            <Mail size={16} />
            {t("offer.sendMessage", "Wyślij wiadomość")}
          </button>
        </div>
      </div>

      {/* Specyfikacja / dane oferty */}
      <OfferSpecsList offer={offer} />

      {/* Rezerwacja */}
      {reservationOpen && (
        <ReservationModal
          offerId={offerId}
          unavailableDates={unavailableDates}
          isOpen={reservationOpen}
          onClose={() => setReservationOpen(false)}
        />
      )}

      {/* E-podpis pod ofertą */}
      <DocumentSignaturePanel type="offer" offerId={offerId} />
    </div>
  );
};

export default OfferDetails;
