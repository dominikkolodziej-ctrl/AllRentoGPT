import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import { Button } from "@/components/ui/button.jsx";

const DEFAULT_FAVORITES = [
  { id: 1, title: "Wózek widłowy Toyota", location: "Wrocław" },
  { id: 2, title: "Scena eventowa 50m²", location: "Warszawa" },
];

const Favorites = () => {
  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;
  const ui = useMemo(
    () => ({
      page: `max-w-7xl mx-auto px-4 py-16 ${theme?.classes?.page || ""}`.trim(),
      title: "text-3xl md:text-5xl font-bold mb-8 text-center text-blue-700",
      card: `border rounded-lg p-6 bg-white hover:shadow-lg transition ${theme?.classes?.card || ""}`.trim(),
      location: `text-gray-500 ${theme?.classes?.mutedText || ""}`.trim(),
      removeBtn: `mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full ${theme?.classes?.dangerButton || ""}`.trim(),
    }),
    [theme]
  );

  const [favorites, setFavorites] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem("favorites");
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Reading favorites from localStorage failed", e);
    }
    return DEFAULT_FAVORITES;
  });

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("favorites", JSON.stringify(favorites));
      }
    } catch (e) {
      console.warn("Saving favorites to localStorage failed", e);
    }
  }, [favorites]);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "favorites_view", count: favorites.length, ts: Date.now() })], {
          type: "application/json",
        })
      );
    }
  }, [favorites.length]);

  const removeFavorite = useCallback(
    (id) => {
      const snapshot = favorites;
      setFavorites((prev) => prev.filter((fav) => fav.id !== id));
      toast.custom(
        (tctx) => (
          <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 rounded border px-3 py-2 shadow">
            <span>{t("favorites.removed", "Usunięto z ulubionych")}</span>
            <button
              onClick={() => {
                toast.dismiss(tctx.id);
                setFavorites(snapshot);
              }}
              className="px-3 py-1.5 rounded border"
              aria-label={t("common.undo", "Cofnij")}
            >
              {t("common.undo", "Cofnij")}
            </button>
          </div>
        ),
        { duration: 5000 }
      );
    },
    [favorites, t]
  );

  return (
    <div className={ui.page} data-screen="favorites" data-theme={dataTheme}>
      <h1 className={ui.title}>{t("favorites.title", "Moje Ulubione Oferty")}</h1>

      {favorites.length === 0 ? (
        <p className="text-center text-gray-500">{t("favorites.empty", "Nie masz żadnych zapisanych ofert.")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((offer) => (
            <div key={offer.id} className={ui.card}>
              <h2 className="text-xl font-semibold text-blue-600">{offer.title}</h2>
              <p className={ui.location}>{offer.location}</p>
              <Button
                onClick={() => removeFavorite(offer.id)}
                className={ui.removeBtn}
                aria-label={t("favorites.remove", "Usuń z ulubionych")}
              >
                {t("favorites.remove", "Usuń z ulubionych")}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
