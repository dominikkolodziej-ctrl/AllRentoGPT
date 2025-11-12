import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useAuth } from "@/context/AuthContext.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";

export default function VerifyAccount() {
  const theme = useTheme?.();
  const live = useLiveText();
  const auth = useAuth();

  const t = useCallback(
    (k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k),
    [live]
  );

  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;

  const styles = useMemo(
    () => ({
      backgroundColor: theme?.colors?.background,
      color: theme?.colors?.text,
    }),
    [theme]
  );

  const [email, setEmail] = useState(() => auth?.authUser?.email || auth?.user?.email || "");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "verify_view", ts: Date.now() })], {
          type: "application/json",
        })
      );
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const resend = useCallback(async () => {
    if (!email) {
      toast.error(t("verify.emailRequired", "Podaj adres e-mail"));
      return;
    }
    try {
      await axios.post(
        "/api/auth/resend-verification",
        { email },
        { headers: { "Content-Type": "application/json" } }
      );
      toast.success(t("verify.sent", "Wysłaliśmy nowy link weryfikacyjny"));
      setCooldown(30);
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon(
          "/api/audit/event",
          new Blob([JSON.stringify({ type: "verify_resend", email, ts: Date.now() })], {
            type: "application/json",
          })
        );
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        t("verify.error", "Nie udało się wysłać linku");
      toast.error(msg);
    }
  }, [email, t]);

  return (
    <div
      className="min-h-screen flex items-center justify-center text-center px-4"
      style={styles}
      data-theme={dataTheme}
      data-screen="verify-account"
    >
      <div className={`bg-white p-6 rounded shadow-md w-full max-w-sm ${theme?.classes?.card || ""}`}>
        <h2 className="text-lg font-bold mb-2" style={{ color: theme?.colors?.primary }}>
          {t("verify.title", "Zweryfikuj swoje konto")}
        </h2>
        <p className={`mb-4 ${theme?.classes?.mutedText || "text-gray-600"}`}>
          {t("verify.instructions", "Sprawdź skrzynkę e-mail i kliknij w link aktywacyjny.")}
        </p>

        <label htmlFor="email" className="sr-only">
          E-mail
        </label>
        <Input
          id="email"
          type="email"
          placeholder={t("verify.emailPh", "Twój e-mail")}
          className="w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />

        <Button
          onClick={resend}
          disabled={cooldown > 0}
          className={`w-full py-2 text-white rounded ${theme?.classes?.button || ""}`}
          style={{ backgroundColor: theme?.colors?.primary }}
          aria-busy={cooldown > 0 ? "true" : "false"}
        >
          {cooldown > 0
            ? t("verify.resendIn", "Wyślij ponownie za") + ` ${cooldown}s`
            : t("verify.resend", "Wyślij link ponownie")}
        </Button>

        <div className={`mt-3 text-sm ${theme?.classes?.mutedText || "text-gray-500"}`}>
          {t("verify.or", "lub")}{" "}
          <Link to="/login" className={`text-blue-600 hover:underline ${theme?.classes?.link || ""}`}>
            {t("verify.backToLogin", "wróć do logowania")}
          </Link>
        </div>
      </div>
    </div>
  );
}
