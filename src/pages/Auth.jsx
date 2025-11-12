import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";

const Auth = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

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
      page: `flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6 ${theme?.classes?.page || ""}`.trim(),
      card: `bg-white p-8 rounded-xl shadow-lg w-full max-w-md ${theme?.classes?.card || ""}`.trim(),
      title: "text-3xl font-bold text-center text-blue-700 mb-6",
      label: "text-sm font-medium",
      checkboxWrap: "flex items-center gap-2 text-sm",
      link: `text-blue-600 hover:underline ${theme?.classes?.link || ""}`.trim(),
    }),
    [theme]
  );

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob(
          [
            JSON.stringify({
              type: "auth_view",
              mode: isRegister ? "register" : "login",
              ts: Date.now(),
            }),
          ],
          { type: "application/json" }
        )
      );
    }
  }, [isRegister]);

  // Fallback: ustaw Authorization w axios z localStorage (gdy AuthContext nie robi tego sam)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("token");
      if (token) {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      } else {
        delete axios.defaults.headers.common.Authorization;
      }
    }
  }, []);

  const onChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const errors = [];
    if (!form.email.trim()) errors.push(t("auth.emailRequired", "Email jest wymagany"));
    if (!form.password.trim()) errors.push(t("auth.passwordRequired", "Hasło jest wymagane"));
    if (isRegister) {
      if (!form.companyName.trim()) errors.push(t("auth.companyRequired", "Nazwa firmy jest wymagana"));
      if (form.password !== form.confirmPassword)
        errors.push(t("auth.passwordsMismatch", "Hasła muszą być takie same"));
      if (!form.acceptTerms) errors.push(t("auth.acceptTerms", "Musisz zaakceptować regulamin"));
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length) {
      errs.forEach((msg) => toast.error(msg));
      return;
    }
    setSubmitting(true);
    try {
      if (isRegister) {
        const payload = {
          companyName: form.companyName,
          email: form.email,
          password: form.password,
        };
        if (typeof auth?.register === "function") {
          await auth.register(payload);
        } else {
          await axios.post("/api/auth/register", payload, {
            headers: { "Content-Type": "application/json" },
          });
        }
        toast.success(t("auth.registerSuccess", "Konto utworzone. Zaloguj się."));
        navigate("/login", { replace: true });
      } else {
        const payload = { email: form.email, password: form.password };
        if (typeof auth?.login === "function") {
          await auth.login(payload);
        } else {
          const res = await axios.post("/api/auth/login", payload, {
            headers: { "Content-Type": "application/json" },
          });
          if (res?.data?.token && typeof window !== "undefined") {
            window.localStorage.setItem("token", res.data.token);
            axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
          }
        }
        toast.success(t("auth.loginSuccess", "Zalogowano"));
        navigate("/dashboard", { replace: true });
      }

      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon(
          "/api/audit/event",
          new Blob(
            [
              JSON.stringify({
                type: isRegister ? "register_submit" : "login_submit",
                ts: Date.now(),
              }),
            ],
            { type: "application/json" }
          )
        );
      }
    } catch {
      toast.error(
        isRegister
          ? t("auth.registerFail", "Nie udało się utworzyć konta")
          : t("auth.loginFail", "Nie udało się zalogować")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleForm = () => setIsRegister((v) => !v);

  return (
    <div className={ui.page} data-screen="auth" data-theme={dataTheme}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={ui.card}
      >
        <h2 className={ui.title}>
          {isRegister ? t("auth.registerTitle", "Załóż Konto Firmowe") : t("auth.loginTitle", "Zaloguj się")}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRegister && (
            <div className="space-y-1">
              <label htmlFor="companyName" className={ui.label}>
                {t("auth.company", "Nazwa firmy")}
              </label>
              <Input
                id="companyName"
                placeholder={t("auth.companyPh", "np. Allrento Sp. z o.o.")}
                value={form.companyName}
                onChange={(e) => onChange("companyName", e.target.value)}
                aria-required={isRegister ? "true" : "false"}
              />
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className={ui.label}>
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="email@firma.pl"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              aria-required="true"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className={ui.label}>
              {t("auth.password", "Hasło")}
            </label>
            <Input
              id="password"
              type="password"
              placeholder={t("auth.passwordPh", "Hasło")}
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
              aria-required="true"
            />
          </div>

          {!isRegister && (
            <div className="text-right text-sm">
              <Link to="/reset-password" className={ui.link}>
                {t("auth.forgot", "Zapomniałeś hasła?")}
              </Link>
            </div>
          )}

          {isRegister && (
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className={ui.label}>
                {t("auth.repeatPassword", "Powtórz hasło")}
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t("auth.repeatPasswordPh", "Powtórz hasło")}
                value={form.confirmPassword}
                onChange={(e) => onChange("confirmPassword", e.target.value)}
                aria-required={isRegister ? "true" : "false"}
              />
            </div>
          )}

          {isRegister && (
            <label className={ui.checkboxWrap} htmlFor="acceptTerms">
              <input
                id="acceptTerms"
                type="checkbox"
                className="w-4 h-4"
                checked={form.acceptTerms}
                onChange={(e) => onChange("acceptTerms", e.target.checked)}
              />
              <span>
                {t("auth.accept", "Akceptuję")}{" "}
                <Link to="/terms" className={ui.link}>
                  {t("auth.terms", "regulamin")}
                </Link>
                .
              </span>
            </label>
          )}

          <Button
            type="submit"
            disabled={submitting}
            aria-busy={submitting ? "true" : "false"}
            className="w-full"
          >
            {submitting
              ? t("common.processing", "Przetwarzanie...")
              : isRegister
              ? t("auth.registerCta", "Zarejestruj się")
              : t("auth.loginCta", "Zaloguj się")}
          </Button>
        </form>

        <div className="text-center mt-6">
          {isRegister ? (
            <p className="text-gray-600 text-sm">
              {t("auth.haveAccount", "Masz już konto?")}{" "}
              <button onClick={toggleForm} className={ui.link} type="button">
                {t("auth.loginLink", "Zaloguj się")}
              </button>
            </p>
          ) : (
            <p className="text-gray-600 text-sm">
              {t("auth.noAccount", "Nie masz konta?")}{" "}
              <button onClick={toggleForm} className={ui.link} type="button">
                {t("auth.registerLink", "Zarejestruj się")}
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
