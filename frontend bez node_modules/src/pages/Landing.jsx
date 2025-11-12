import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Card from "../components/Card";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";

const promotedOffers = [
  {
    id: "1",
    title: "Wynajem koparki CAT 320",
    price: "450",
    location: "Warszawa",
    imageUrl: "https://via.placeholder.com/400x300?text=Koparka",
  },
  {
    id: "2",
    title: "Transport HDS",
    price: "300",
    location: "Poznań",
    imageUrl: "https://via.placeholder.com/400x300?text=HDS",
  },
  {
    id: "3",
    title: "Podnośnik koszowy",
    price: "500",
    location: "Wrocław",
    imageUrl: "https://via.placeholder.com/400x300?text=Podnośnik",
  },
  {
    id: "4",
    title: "Namiot Eventowy",
    price: "1200",
    location: "Kraków",
    imageUrl: "https://via.placeholder.com/400x300?text=Namiot",
  },
  {
    id: "5",
    title: "Rusztowanie jezdne",
    price: "100",
    location: "Łódź",
    imageUrl: "https://via.placeholder.com/400x300?text=Rusztowanie",
  },
  {
    id: "6",
    title: "Wózek widłowy",
    price: "200",
    location: "Gdańsk",
    imageUrl: "https://via.placeholder.com/400x300?text=Wózek",
  },
];

const Landing = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;

  const ui = useMemo(
    () => ({
      page: `flex flex-col min-h-screen bg-gradient-to-b from-blue-100 to-white scroll-smooth ${theme?.classes?.page || ""}`.trim(),
      hero: "relative h-[75vh] flex items-center justify-center text-center bg-cover bg-center",
      heroOverlay: "absolute inset-0 bg-black bg-opacity-60",
      heroInner: "relative z-10 text-white px-4",
      heroTitle: "text-4xl md:text-6xl font-bold mb-6",
      heroSubtitle: "text-lg md:text-2xl mb-8 max-w-2xl mx-auto",
      form: "max-w-2xl mx-auto flex gap-4 px-2",
      input: `${theme?.classes?.input || ""}`.trim(),
      btn: `bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full ${theme?.classes?.button || ""}`.trim(),
      section: "py-20 bg-white",
      container: "max-w-7xl mx-auto px-4",
      grid: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6",
      headerRow: "flex justify-between items-center mb-6",
      headerTitle: "text-3xl md:text-4xl font-bold text-blue-700",
      link: `text-blue-600 hover:underline font-semibold ${theme?.classes?.link || ""}`.trim(),
    }),
    [theme]
  );

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "landing_view", ts: Date.now() })], {
          type: "application/json",
        })
      );
    }
  }, []);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      const value = query.trim();
      if (!value) return;
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon(
          "/api/audit/event",
          new Blob([JSON.stringify({ type: "landing_search", q: value, ts: Date.now() })], {
            type: "application/json",
          })
        );
      }
      navigate(`/offers?query=${encodeURIComponent(value)}`);
    },
    [navigate, query]
  );

  return (
    <div className={ui.page} data-screen="landing" data-theme={dataTheme}>
      <section
        className={ui.hero}
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')",
        }}
      >
        <div className={ui.heroOverlay} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={ui.heroInner}
        >
          <h1 className={ui.heroTitle}>{t("landing.headline", "Znajdź i wynajmij profesjonalnie")}</h1>
          <p className={ui.heroSubtitle}>
            {t("landing.subhead", "Sprzęt, pojazdy, usługi — wszystko w jednym miejscu")}
          </p>

          <form onSubmit={handleSearch} className={ui.form}>
            <label htmlFor="landing-search" className="sr-only">
              {t("landing.searchLabel", "Wyszukaj oferty")}
            </label>
            <Input
              id="landing-search"
              type="text"
              placeholder={t("landing.searchPh", "np. koparka, transport, namiot...")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={t("landing.searchAria", "Wpisz zapytanie wyszukiwania")}
            />
            <Button type="submit" className={ui.btn} aria-label={t("landing.searchCta", "Szukaj")}>
              {t("landing.searchCta", "Szukaj")}
            </Button>
          </form>
        </motion.div>
      </section>

      <section className={ui.section}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className={ui.container}
        >
          <div className={ui.headerRow}>
            <h2 className={ui.headerTitle}>{t("landing.promoted", "Promowane Oferty")}</h2>
            <Link to="/offers" className={ui.link}>
              {t("landing.seeAll", "Zobacz wszystkie →")}
            </Link>
          </div>

          <div className={ui.grid}>
            {promotedOffers.map((offer) => (
              <Card
                key={offer.id}
                id={offer.id}
                title={offer.title}
                price={offer.price}
                location={offer.location}
                imageUrl={offer.imageUrl}
              />
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
