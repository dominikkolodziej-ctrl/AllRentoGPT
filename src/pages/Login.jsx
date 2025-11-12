import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";

const Login = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;

  const ui = useMemo(
    () => ({
      page: `max-w-md mx-auto mt-16 bg-white p-6 shadow rounded ${theme?.classes?.page || ""}`.trim(),
      title: "text-2xl font-bold text-center mb-6",
      field: "space-y-1",
      label: "text-sm font-medium",
      inputWrap: "relative",
      toggleBtn: "absolute right-2 top-2 text-sm text-blue-600",
      error: "text-red-500 text-sm mt-2",
      hintRow: `flex items-center justify-between text-sm ${theme?.classes?.mutedText || ""}`.trim(),
      submitBtn: `w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60 ${theme?.classes?.button || ""}`.trim(),
      link: `text-blue-600 hover:underline ${theme?.classes?.link || ""}`.trim(),
    }),
    [theme]
  );

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "login_view", ts: Date.now() })], {
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

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setErrMsg("");
      setLoading(true);

      try {
        let userData = null;

        if (typeof auth?.login === "function") {
          const maybeData = await auth.login({ email, password });
          userData = maybeData?.data || maybeData || auth?.authUser || null;
        } else {
          const res = await axios.post(
            "/api/auth/login",
            { email, password },
            { headers: { "Content-Type": "application/json" } }
          );
          userData = res?.data || null;

          if (userData?.token && typeof window !== "undefined") {
            window.localStorage.setItem("token", userData.token);
          }
          if (typeof auth?.setAuthUser === "function") {
            auth.setAuthUser(userData);
          } else if (typeof window !== "undefined") {
            window.localStorage.setItem("authUser", JSON.stringify(userData));
          }
        }

        toast.success(t("auth.loginSuccess", "Zalogowano"));
        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
          navigator.sendBeacon(
            "/api/audit/event",
            new Blob([JSON.stringify({ type: "login_success", email, ts: Date.now() })], {
              type: "application/json",
            })
          );
        }

        resolveUserAndNavigate(userData);
      } catch (error) {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          t("auth.loginFail", "Nie udało się zalogować");
        setErrMsg(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [auth, email, password, resolveUserAndNavigate, t]
  );

  return (
    <div className={ui.page} data-screen="login" data-theme={dataTheme}>
      <h1 className={ui.title}>{t("auth.loginTitle", "Logowanie")}</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className={ui.field}>
          <label htmlFor="email" className={ui.label}>
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@firma.pl"
            required
            autoComplete="username"
          />
        </div>

        <div className={ui.field}>
          <label htmlFor="password" className={ui.label}>
            {t("auth.password", "Hasło")}
          </label>
          <div className={ui.inputWrap}>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.passwordPh", "Hasło")}
              required
              autoComplete="current-password"
              aria-describedby="password-help"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className={ui.toggleBtn}
              aria-label={showPassword ? t("auth.hidePwd", "Ukryj hasło") : t("auth.showPwd", "Pokaż hasło")}
            >
              {showPassword ? t("auth.hide", "Ukryj") : t("auth.show", "Pokaż")}
            </button>
          </div>
          <div id="password-help" className={ui.hintRow}>
            <span />
            <Link to="/reset-password" className={ui.link}>
              {t("auth.forgot", "Zapomniałeś hasła?")}
            </Link>
          </div>
        </div>

        <Button type="submit" disabled={loading} className={ui.submitBtn} aria-busy={loading ? "true" : "false"}>
          {loading ? t("auth.loggingIn", "Logowanie...") : t("auth.loginCta", "Zaloguj się")}
        </Button>

        {errMsg && <p className={ui.error} role="alert">{errMsg}</p>}
      </form>
    </div>
  );
};

export default Login;
