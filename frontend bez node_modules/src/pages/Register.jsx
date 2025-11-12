import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";

export default function Register() {
  const navigate = useNavigate();
  const auth = useAuth();
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
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "register_view", ts: Date.now() })], {
          type: "application/json",
        })
      );
    }
  }, []);

  const resolveUserAndNavigate = useCallback(
    (data) => {
      const role = String(data?.role || "").toLowerCase();
      if (role === "admin") navigate("/dashboard/admin", { replace: true });
      else if (role === "provider") navigate("/dashboard/provider", { replace: true });
      else navigate("/dashboard/client", { replace: true });
    },
    [navigate]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!accept) {
        toast.error(t("auth.acceptTerms", "Musisz zaakceptować regulamin"));
        return;
      }
      if (password.length < 6) {
        toast.error(t("auth.pwdShort", "Hasło musi mieć co najmniej 6 znaków"));
        return;
      }
      if (password !== confirm) {
        toast.error(t("auth.pwdMismatch", "Hasła nie są takie same"));
        return;
      }
      setLoading(true);
      try {
        const res = await axios.post(
          "/api/auth/register",
          { email, password },
          { headers: { "Content-Type": "application/json" } }
        );
        const data = res?.data || {};
        toast.success(t("auth.registerSuccess", "Konto zostało utworzone"));
        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
          navigator.sendBeacon(
            "/api/audit/event",
            new Blob([JSON.stringify({ type: "register_success", email, ts: Date.now() })], {
              type: "application/json",
            })
          );
        }
        if (data?.token) {
          if (typeof window !== "undefined") {
            window.localStorage.setItem("token", data.token);
            window.localStorage.setItem("authUser", JSON.stringify(data));
          }
          if (typeof auth?.setAuthUser === "function") auth.setAuthUser(data);
          resolveUserAndNavigate(data);
        } else {
          navigate("/login", { replace: true });
        }
      } catch (error) {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          t("auth.registerFail", "Rejestracja nie powiodła się");
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [accept, auth, confirm, email, navigate, password, resolveUserAndNavigate, t]
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={styles} data-theme={dataTheme} data-screen="register">
      <form className={ui.card} onSubmit={handleSubmit} noValidate>
        <h2 className={ui.title} style={{ color: theme?.colors?.primary }}>{t("auth.register", "Rejestracja")}</h2>

        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Email"
          className="w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />

        <label htmlFor="password" className="sr-only">
          Hasło
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Hasło"
          className="w-full mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <label htmlFor="confirm" className="sr-only">
          Powtórz hasło
        </label>
        <Input
          id="confirm"
          type="password"
          placeholder="Powtórz hasło"
          className="w-full mb-3"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
        />

        <label className="flex items-center gap-2 mb-3 text-sm">
          <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
          <span>
            {t("auth.accept", "Akceptuję")}{" "}
            <Link to="/terms" className={ui.link}>
              {t("auth.terms", "regulamin")}
            </Link>
          </span>
        </label>

        <Button
          type="submit"
          disabled={loading}
          className={ui.submit}
          style={{ backgroundColor: theme?.colors?.primary }}
          aria-busy={loading ? "true" : "false"}
        >
          {loading ? t("auth.creating", "Tworzenie konta...") : t("auth.registerCta", "Zarejestruj się")}
        </Button>

        <div className={ui.hint}>
          {t("auth.haveAccount", "Masz już konto?")}{" "}
          <Link to="/login" className={ui.link}>
            {t("auth.login", "Zaloguj się")}
          </Link>
        </div>
      </form>
    </div>
  );
}
