import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";

export default function ResetPassword() {
  const theme = useTheme?.();
  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;

  const styles = useMemo(
    () => ({
      backgroundColor: theme?.colors?.background,
      color: theme?.colors?.text,
    }),
    [theme]
  );

  const ui = useMemo(
    () => ({
      card: `bg-white p-6 rounded shadow-md w-full max-w-sm ${theme?.classes?.card || ""}`.trim(),
      title: "text-lg font-bold mb-4",
      submit: `w-full py-2 text-white rounded ${theme?.classes?.button || ""}`.trim(),
      link: `text-blue-600 hover:underline ${theme?.classes?.link || ""}`.trim(),
      hint: `mt-3 text-sm text-gray-500 ${theme?.classes?.mutedText || ""}`.trim(),
    }),
    [theme]
  );

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "reset_view", ts: Date.now() })], { type: "application/json" })
      );
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!email) {
        toast.error(t("auth.emailRequired", "Podaj adres e-mail"));
        return;
      }
      setLoading(true);
      try {
        const res = await axios.post(
          "/api/auth/reset-password",
          { email },
          { headers: { "Content-Type": "application/json" } }
        );
        if (res?.status >= 200 && res?.status < 300) {
          toast.success(t("auth.resetSent", "Wysłano link resetujący na e-mail"));
          if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
            navigator.sendBeacon(
              "/api/audit/event",
              new Blob([JSON.stringify({ type: "reset_request_success", email, ts: Date.now() })], {
                type: "application/json",
              })
            );
          }
        } else {
          throw new Error();
        }
      } catch (error) {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          t("auth.resetFail", "Nie udało się wysłać linku resetującego");
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [email, t]
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={styles}
      data-theme={dataTheme}
      data-screen="reset-password"
    >
      <form className={ui.card} onSubmit={handleSubmit} noValidate>
        <h2 className={ui.title} style={{ color: theme?.colors?.primary }}>
          {t("auth.resetTitle", "Resetuj hasło")}
        </h2>

        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Twój email"
          className="w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />

        <Button
          type="submit"
          disabled={loading}
          className={ui.submit}
          style={{ backgroundColor: theme?.colors?.primary }}
          aria-busy={loading ? "true" : "false"}
        >
          {loading ? t("auth.sending", "Wysyłanie...") : t("auth.sendLink", "Wyślij link")}
        </Button>

        <div className={ui.hint}>
          {t("auth.rememberPwd", "Pamiętasz hasło?")}{" "}
          <Link to="/login" className={ui.link}>
            {t("auth.login", "Zaloguj się")}
          </Link>
        </div>
      </form>
    </div>
  );
}
