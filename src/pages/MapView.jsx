// src/pages/MapView.jsx – komponent klasy enterprise z rozszerzeniami Bloku 3
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

import SearchBar from "../components/SearchBar";
import MapPopupModal from "../components/MapPopupModal";
import ReservationModal from "../components/ReservationModal";

import OfferFilters from "@/components/OfferFilters.jsx";
import { useFilters } from "@/hooks/useFilters.js";
import * as offersApi from "@/api/offersApi.js";

import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import DocumentSignaturePanel from "@/components/signature/DocumentSignaturePanel.jsx";

const containerStyle = { width: "100%", height: "100vh" };
const defaultCenter = { lat: 52.2297, lng: 21.0122 };

const haversineKm = (a, b) => {
  if (!a || !b) return Infinity;
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad((b.lat || 0) - (a.lat || 0));
  const dLng = toRad((b.lng || 0) - (a.lng || 0));
  const s1 =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat || 0)) *
      Math.cos(toRad(b.lat || 0)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
  return R * c;
};

const MapView = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const live = useLiveText();
  const t = useCallback((k, d) => (live?.t ? live.t(k, d) : d ?? k), [live]);
  const theme = useTheme?.();
  const dataTheme = theme?.theme || theme?.current || theme?.name || theme?.mode || undefined;

  const location = useLocation();
  const navigate = useNavigate();

  const mapRef = useRef(null);
  const exportUrlRef = useRef(null);

  // TE SAME FILTRY CO W LIŚCIE OFERT
  const {
    filters,
    setFilters,
    setFilter,
    setPage,
    toggleTag,
    clearTags,
    apiParams,
  } = useFilters({
    q: "",
    sort: "-updatedAt",
    page: 1,
    limit: 50,
    onlyPublished: true,
  });

  const [rawOffers, setRawOffers] = useState([]);
  const [center, setCenter] = useState(() => {
    try {
      const cached = typeof window !== "undefined" && window.localStorage.getItem("mapCenter");
      return cached ? JSON.parse(cached) : defaultCenter;
    } catch {
      return defaultCenter;
    }
  });
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [error, setError] = useState("");

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      clickableIcons: false,
      gestureHandling: "greedy",
      styles: theme?.mapStyles || undefined,
    }),
    [theme]
  );

  // scoring + dystans
  const offers = useMemo(() => {
    const valid = (rawOffers || []).filter(
      (o) => typeof o?.lat === "number" && typeof o?.lng === "number"
    );
    return valid
      .map((o) => {
        const priceNum =
          typeof o?.price === "number"
            ? o.price
            : Number(String(o?.price || "").replace(/[^\d.,-]/g, "").replace(",", "."));
        const distance = haversineKm(center, { lat: o.lat, lng: o.lng });
        let score = 50;
        if (Number.isFinite(priceNum)) score += priceNum > 0 ? Math.max(0, 30 - Math.min(30, priceNum / 10)) : 0;
        if (Number.isFinite(distance)) score += Math.max(0, 20 - Math.min(20, distance));
        return {
          ...o,
          distanceKm: Math.round(distance * 10) / 10,
          aiScore: Math.min(100, Math.max(0, Math.round(score))),
        };
      })
      .sort((a, b) => b.aiScore - a.aiScore);
  }, [rawOffers, center]);

  const fitBoundsToOffers = useCallback((list) => {
    if (!mapRef.current || !list?.length) return;
    const google = window.google;
    if (!google?.maps) return;
    const bounds = new google.maps.LatLngBounds();
    list.forEach((o) => bounds.extend({ lat: o.lat, lng: o.lng }));
    try {
      mapRef.current.fitBounds(bounds, { top: 80, bottom: 80, left: 80, right: 80 });
    } catch {
      /* no-op */
    }
  }, []);

  // ładujemy dane używając tych samych parametrów co lista
  const refreshOffers = useCallback(async () => {
    setLoadingOffers(true);
    setError("");
    try {
      let list = [];
      if (typeof offersApi.listOffers === "function") {
        const { items } = await offersApi.listOffers(apiParams);
        list = Array.isArray(items) ? items : [];
      } else if (typeof offersApi.getOffers === "function") {
        const data = await offersApi.getOffers({});
        list = Array.isArray(data) ? data : [];
      }
      setRawOffers(list);

      if (navigator?.sendBeacon) {
        navigator.sendBeacon(
          "/api/audit/event",
          new Blob([JSON.stringify({ type: "map_offers_loaded", count: list.length, ts: Date.now() })], {
            type: "application/json",
          })
        );
      }
      setTimeout(() => fitBoundsToOffers(list), 0);
    } catch {
      setError(t("map.loadError", "Nie udało się pobrać ofert na mapie"));
    } finally {
      setLoadingOffers(false);
    }
  }, [apiParams, fitBoundsToOffers, t]);

  // pierwszy load + refetch przy zmianie filtrów
  useEffect(() => {
    refreshOffers();
  }, [refreshOffers, apiParams.q, apiParams.sort, apiParams.page, apiParams.limit, apiParams.onlyPublished]);

  // odczyt oferty z query (?offerId=)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const offerId = params.get("offerId");
    if (!offerId || offers.length === 0) return;
    const found = offers.find((o) => String(o._id || o.id) === String(offerId));
    if (found) setSelectedOffer(found);
  }, [location.search, offers]);

  // persist center
  useEffect(() => {
    try {
      window?.localStorage?.setItem("mapCenter", JSON.stringify(center));
    } catch {
      /* no-op */
    }
  }, [center]);

  // telemetry: wejście na mapę
  useEffect(() => {
    if (navigator?.sendBeacon) {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "map_view", ts: Date.now() })], { type: "application/json" })
      );
    }
  }, []);

  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const handleExport = useCallback(
    (format) => {
      const rows = offers.map((o) => ({
        id: o._id || o.id,
        title: o.title,
        lat: o.lat,
        lng: o.lng,
        price: o.price,
        distanceKm: o.distanceKm,
        aiScore: o.aiScore,
      }));

      let blob;
      if (format === "csv") {
        const header = ["id", "title", "lat", "lng", "price", "distanceKm", "aiScore"];
        const csv =
          [header.join(";")]
            .concat(
              rows.map((r) =>
                header.map((h) => `"${String(r[h] ?? "").replaceAll(`"`, `""`)}"`).join(";")
              )
            )
            .join("\n") + "\n";
        blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      } else {
        blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json;charset=utf-8;" });
      }

      if (exportUrlRef.current) {
        URL.revokeObjectURL(exportUrlRef.current);
        exportUrlRef.current = null;
      }
      const url = URL.createObjectURL(blob);
      exportUrlRef.current = url;
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "csv" ? "offers_map.csv" : "offers_map.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
    [offers]
  );

  const ui = useMemo(
    () => ({
      filtersWrap: "absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[min(1100px,95vw)]",
      toolbar:
        "mt-2 bg-white/90 backdrop-blur rounded shadow px-3 py-2 flex items-center gap-2",
      actions:
        "absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur rounded shadow px-3 py-2 flex items-center gap-2",
      badge: "px-2 py-1 text-xs rounded bg-blue-600 text-white",
      btn: "px-3 py-1.5 rounded border text-sm bg-white hover:bg-gray-50",
      error: "absolute top-4 right-4 z-20 bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded",
      loading: "absolute top-4 right-4 z-20 bg-white/90 px-3 py-2 rounded shadow",
    }),
    []
  );

  if (!isLoaded) {
    return <div className="p-4" aria-live="polite">{t("map.loading", "Ładowanie mapy...")}</div>;
  }

  return (
    <div className="relative" data-screen="map-view" data-theme={dataTheme}>
      {/* TE SAME FILTRY CO W LIŚCIE */}
      <div className={ui.filtersWrap}>
        <OfferFilters
          filters={filters}
          setFilters={setFilters}
          setFilter={setFilter}
          setPage={setPage}
          toggleTag={toggleTag}
          clearTags={clearTags}
          className={ui.toolbar}
        />
        <div className={ui.toolbar} role="group" aria-label={t("map.tools", "Narzędzia mapy")}>
          <span className={ui.badge}>{t("map.offers", "Oferty")}: {offers.length}</span>
          <button className={ui.btn} onClick={() => refreshOffers()} aria-label={t("common.refresh", "Odśwież")}>
            {t("common.refresh", "Odśwież")}
          </button>
          <button className={ui.btn} onClick={() => handleExport("csv")} aria-label={t("common.exportCsv", "Eksport CSV")}>
            {t("common.exportCsv", "Eksport CSV")}
          </button>
          <button className={ui.btn} onClick={() => handleExport("json")} aria-label={t("common.exportJson", "Eksport JSON")}>
            {t("common.exportJson", "Eksport JSON")}
          </button>
        </div>
      </div>

      {/* Twój SearchBar zostaje – steruje centrum mapy */}
      <SearchBar onSearchResult={(coords) => setCenter(coords)} />

      {error && <div className={ui.error} role="alert">{error}</div>}
      {loadingOffers && !error && <div className={ui.loading} role="status">{t("common.loading", "Ładowanie...")}</div>}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        options={mapOptions}
        onLoad={handleMapLoad}
        onDragEnd={() => {
          const m = mapRef.current;
          if (m) {
            const c = m.getCenter();
            if (c) setCenter({ lat: c.lat(), lng: c.lng() });
          }
        }}
      >
        {offers.map((offer) => (
          <Marker
            key={offer._id || offer.id}
            position={{ lat: offer.lat, lng: offer.lng }}
            onClick={() => {
              setSelectedOffer(offer);
              window.history.pushState({}, "", `?offerId=${encodeURIComponent(offer._id || offer.id)}`);
              if (navigator?.sendBeacon) {
                navigator.sendBeacon(
                  "/api/audit/event",
                  new Blob([JSON.stringify({ type: "map_marker_click", id: offer._id || offer.id, ts: Date.now() })], {
                    type: "application/json",
                  })
                );
              }
            }}
            label={
              typeof offer.aiScore === "number"
                ? { text: String(offer.aiScore), className: "text-xs font-bold" }
                : undefined
            }
          />
        ))}
      </GoogleMap>

      <div className={ui.actions} role="group" aria-label={t("map.actions", "Akcje")}>
        {selectedOffer ? (
          <>
            <span className="text-sm">
              {selectedOffer.title} • {t("map.distance", "dystans")}{" "}
              {Number.isFinite(selectedOffer.distanceKm) ? `${selectedOffer.distanceKm} km` : "—"} • AI {selectedOffer.aiScore}
            </span>
            <button className={ui.btn} onClick={() => setReservationOpen(true)} aria-label={t("offer.reserve", "Zarezerwuj")}>
              {t("offer.reserve", "Zarezerwuj")}
            </button>
            <button
              className={ui.btn}
              onClick={() => navigate(`/messages/new?offerId=${encodeURIComponent(selectedOffer._id || selectedOffer.id)}`)}
              aria-label={t("offer.sendMessage", "Wyślij wiadomość")}
            >
              {t("offer.sendMessage", "Wyślij wiadomość")}
            </button>
            <button
              className={ui.btn}
              onClick={() => {
                setSelectedOffer(null);
                window.history.pushState({}, "", "/map");
              }}
              aria-label={t("common.close", "Zamknij")}
            >
              {t("common.close", "Zamknij")}
            </button>
          </>
        ) : (
          <span className="text-sm">{t("map.hint", "Wybierz znacznik, aby zobaczyć szczegóły")}</span>
        )}
      </div>

      {/* ⬇️ Wróciło użycie MapPopupModal (żeby nie było „unused import”) */}
      {selectedOffer && (
        <MapPopupModal
          offer={selectedOffer}
          onClose={() => {
            setSelectedOffer(null);
            window.history.pushState({}, "", "/map");
          }}
        />
      )}

      {selectedOffer && (
        <ReservationModal
          offerId={selectedOffer._id || selectedOffer.id}
          isOpen={reservationOpen}
          onClose={() => setReservationOpen(false)}
        />
      )}

      {selectedOffer && (
        <div className="absolute bottom-24 right-4 z-20">
          <DocumentSignaturePanel type="offer" offerId={selectedOffer._id || selectedOffer.id} />
        </div>
      )}
    </div>
  );
};

export default MapView;
