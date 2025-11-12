import React, { useCallback, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";

const PLANS = [
  { id: "basic", name: "Basic", price: 0, currency: "PLN", period: "mies.", features: ["Widoczność podstawowa", "1 ogłoszenie", "Wsparcie e-mail"] },
  { id: "pro", name: "Pro", price: 99, currency: "PLN", period: "mies.", features: ["Wyższa pozycja w wynikach", "10 ogłoszeń", "Wsparcie priorytetowe"] },
  { id: "enterprise", name: "Enterprise", price: 299, currency: "PLN", period: "mies.", features: ["Promowanie ogłoszeń", "Nielimitowane ogłoszenia", "Opiekun klienta"] },
];

const PlansPage = () => {
  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;

  const ui = useMemo(
    () => ({
      page: `max-w-7xl mx-auto p-6 ${theme?.classes?.page || ""}`.trim(),
      title: "text-3xl md:text-4xl font-bold text-center mb-10 text-blue-700",
      grid: "grid grid-cols-1 md:grid-cols-3 gap-6",
      card: `${theme?.classes?.card || ""}`.trim(),
      planName: "text-xl font-semibold",
      price: "text-3xl font-bold",
      muted: `text-gray-600 ${theme?.classes?.mutedText || ""}`.trim(),
      feature: "text-sm",
      btn: `${theme?.classes?.button || ""}`.trim(),
    }),
    [theme]
  );

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "plans_view", ts: Date.now() })], {
          type: "application/json",
        })
      );
    }
  }, []);

  const selectPlan = useCallback((plan) => {
    toast.success(t("plans.selected", "Wybrano plan") + `: ${plan.name}`);
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "plan_selected", planId: plan.id, ts: Date.now() })], {
          type: "application/json",
        })
      );
    }
  }, [t]);

  return (
    <div className={ui.page} data-screen="plans" data-theme={dataTheme}>
      <h1 className={ui.title}>{t("plans.title", "Wybierz plan")}</h1>

      <div className={ui.grid}>
        {PLANS.map((p) => (
          <Card key={p.id} className={ui.card}>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <div className={ui.planName}>{p.name}</div>
                <div className={ui.price}>
                  {p.price}
                  <span className="text-base font-medium ml-1">{p.currency}</span>
                  <span className={`text-sm font-normal ml-2 ${ui.muted}`}>/{p.period}</span>
                </div>
              </div>

              <ul className="space-y-1">
                {p.features.map((f, i) => (
                  <li key={`${p.id}-f-${i}`} className={ui.feature}>• {f}</li>
                ))}
              </ul>

              <Button
                onClick={() => selectPlan(p)}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white ${ui.btn}`}
                aria-label={t("plans.choose", "Wybierz plan")}
              >
                {t("plans.choose", "Wybierz plan")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlansPage;
