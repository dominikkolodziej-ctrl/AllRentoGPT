// src/pages/SubscriptionPlans.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import toast from "react-hot-toast";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";

const plans = [
  {
    name: "Start",
    price: "0 zł",
    features: ["1 aktywna oferta", "Logo i opis firmy", "Odbieranie wiadomości"],
    badge: "Dla testujących",
    color: "gray",
  },
  {
    name: "Pro",
    price: "49 zł / mies.",
    features: ["10 aktywnych ofert", "Dostęp do mapy", "Statystyki wyświetleń", "Wysyłanie wiadomości zbiorczych"],
    badge: "Najpopularniejszy",
    color: "blue",
  },
  {
    name: "Premium",
    price: "99 zł / mies.",
    features: ["Nieograniczona liczba ofert", "Promocja w wynikach", "Powiadomienia e-mail/SMS", "Dostęp do API"],
    badge: "Pełna moc",
    color: "purple",
  },
  {
    name: "Elite",
    price: "199 zł / mies.",
    features: ["Wszystko z Premium", "Eksport danych", "Integracje z CRM", "Zaawansowane statystyki"],
    badge: "Dla liderów branży",
    color: "yellow",
  },
];

const parsePrice = (txt) => {
  const n = Number(String(txt).replace(/[^\d.,-]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;
  const ui = useMemo(
    () => ({
      page: `max-w-7xl mx-auto py-16 px-6 ${theme?.classes?.page || ""}`.trim(),
      card: `bg-white border shadow-md rounded-xl p-6 flex flex-col justify-between hover:shadow-lg transition ${theme?.classes?.card || ""}`.trim(),
      btn: `mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition ${theme?.classes?.button || ""}`.trim(),
      muted: `text-gray-600 ${theme?.classes?.mutedText || ""}`.trim(),
    }),
    [theme]
  );

  const [subscription, setSubscription] = useState(() => {
    try {
      return localStorage.getItem("subscriptionPlan") || "";
    } catch (e) {
      console.warn("Read subscriptionPlan failed", e);
      return "";
    }
  });

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "plans_view", ts: Date.now() })], { type: "application/json" })
      );
    }
  }, []);

  const recommended = useMemo(() => {
    return plans
      .map((p) => ({
        ...p,
        aiScore: Math.round(p.features.length * 25 - parsePrice(p.price) * 0.2),
      }))
      .sort((a, b) => b.aiScore - a.aiScore)[0];
  }, []);

  const handleSelect = useCallback(
    (plan) => {
      const old = subscription;
      try {
        localStorage.setItem("subscriptionPlan", plan.name);
      } catch (e) {
        console.warn("Write subscriptionPlan failed", e);
      }
      setSubscription(plan.name);

      toast.custom(
        (tctx) => (
          <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 rounded border px-3 py-2 shadow">
            <span>
              {t("plans.selected", "Wybrano plan")}: <strong>{plan.name}</strong>
            </span>
            <button
              className="px-3 py-1.5 rounded border"
              onClick={() => {
                try {
                  if (old) localStorage.setItem("subscriptionPlan", old);
                  else localStorage.removeItem("subscriptionPlan");
                } catch (e) {
                  console.warn("Restore subscriptionPlan failed", e);
                }
                setSubscription(old);
                toast.dismiss(tctx.id);
              }}
              aria-label={t("common.undo", "Cofnij")}
            >
              {t("common.undo", "Cofnij")}
            </button>
          </div>
        ),
        { duration: 5000 }
      );

      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon(
          "/api/audit/event",
          new Blob([JSON.stringify({ type: "plan_selected", plan: plan.name, prev: old, ts: Date.now() })], {
            type: "application/json",
          })
        );
      }

      navigate("/dashboard");
    },
    [navigate, subscription, t]
  );

  return (
    <div className={ui.page} data-screen="subscription-plans" data-theme={dataTheme}>
      <h1 className="text-4xl font-bold text-center text-blue-700 mb-10">
        {t("plans.chooseTitle", "Wybierz plan subskrypcji")}
      </h1>

      <p className={`text-center text-sm mb-6 ${ui.muted}`}>
        {t("plans.current", "Twój aktualny plan")}:{" "}
        <span className="font-semibold text-blue-600">
          {subscription || t("plans.none", "Brak aktywnego planu")}
        </span>
      </p>

      <div className="grid md:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className={ui.card}>
            <div>
              <div
                className={clsx("text-xs px-2 py-1 rounded-full w-fit mb-4 text-white", {
                  "bg-gray-600": plan.color === "gray",
                  "bg-blue-600": plan.color === "blue",
                  "bg-purple-600": plan.color === "purple",
                  "bg-yellow-500": plan.color === "yellow",
                })}
              >
                {plan.badge}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-blue-700">{plan.name}</h2>
                {recommended?.name === plan.name && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    {t("plans.ai", "AI")}
                  </span>
                )}
              </div>

              <p className="text-lg font-semibold mb-4">{plan.price}</p>
              <ul className={`text-sm ${ui.muted} space-y-2 mb-6`}>
                {plan.features.map((feature, i) => (
                  <li key={`${plan.name}-${i}`}>• {feature}</li>
                ))}
              </ul>
            </div>

            <button onClick={() => handleSelect(plan)} className={ui.btn} aria-label={t("plans.choose", "Wybierz plan")}>
              {t("plans.choose", "Wybierz plan")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
