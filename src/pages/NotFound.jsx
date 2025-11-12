import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";

export default function NotFound() {
  const theme = useTheme?.();
  const live = useLiveText();
  const t = (k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k);

  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;

  const styles = useMemo(
    () => ({
      backgroundColor: theme?.colors?.background,
      color: theme?.colors?.text,
    }),
    [theme]
  );

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "404_view", ts: Date.now() })], {
          type: "application/json",
        })
      );
    }
  }, []);

  return (
    <div
      className="h-screen flex items-center justify-center flex-col gap-3 text-center px-6"
      style={styles}
      data-screen="not-found"
      data-theme={dataTheme}
    >
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-gray-600">
        {t("notfound.message", "Nie znaleziono strony.")}
      </p>
      <Link
        to="/"
        className="mt-2 inline-flex items-center justify-center rounded px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition"
        aria-label={t("notfound.goHome", "Wróć na stronę główną")}
      >
        {t("notfound.goHome", "Wróć na stronę główną")}
      </Link>
    </div>
  );
}
