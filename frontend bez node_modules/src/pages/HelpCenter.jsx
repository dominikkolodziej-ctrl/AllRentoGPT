import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";

const HelpCenter = () => {
  const live = useLiveText();
  const t = (k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k);

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;

  const ui = useMemo(
    () => ({
      page: `max-w-3xl mx-auto py-12 px-4 ${theme?.classes?.page || ""}`.trim(),
      title: "text-2xl font-bold mb-6",
      paragraph: `mb-4 text-gray-700 ${theme?.classes?.mutedText || ""}`.trim(),
      link: `text-blue-600 hover:underline ${theme?.classes?.link || ""}`.trim(),
      footer: "mt-10 text-sm text-gray-400",
      list: "space-y-3",
    }),
    [theme]
  );

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "help_center_view", ts: Date.now() })], {
          type: "application/json",
        })
      );
    }
  }, []);

  return (
    <div className={ui.page} data-screen="help-center" data-theme={dataTheme}>
      <h1 className={ui.title}>{t("help.title", "Centrum pomocy")}</h1>
      <p className={ui.paragraph}>
        {t(
          "help.intro",
          "Witaj w centrum pomocy B2B Rental. Znajdziesz tu odpowiedzi na najczęstsze pytania, instrukcje i kontakt z administracją."
        )}
      </p>

      <ul className={ui.list} aria-label={t("help.nav", "Nawigacja pomocy")}>
        <li>
          <Link to="/help/faq" className={ui.link}>
            ❓ {t("help.faq", "FAQ – Najczęstsze pytania")}
          </Link>
        </li>
        <li>
          <Link to="/help/contact" className={ui.link}>
            📬 {t("help.contact", "Formularz kontaktowy")}
          </Link>
        </li>
        <li>
          <Link to="/help/privacy" className={ui.link}>
            🔐 {t("help.privacy", "RODO i prywatność")}
          </Link>
        </li>
      </ul>

      <div className={ui.footer}>
        {t("help.demoNote", "Wersja demo – zawartość edytowalna przez panel admina (Blok 7).")}
      </div>
    </div>
  );
};

export default HelpCenter;
