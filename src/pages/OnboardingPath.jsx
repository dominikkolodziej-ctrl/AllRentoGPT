import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";

export default function OnboardingPath() {
  const auth = useAuth();
  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);
  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;

  const NEEDS = ["koparka", "agregat", "kontener", "hala"];

  const [form, setForm] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem("onboardingDraft");
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Failed to read onboardingDraft from localStorage", e);
    }
    return { industry: "", typicalNeeds: [], area: "" };
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const completeness = useMemo(() => {
    let s = 0;
    if (form.industry) s += 40;
    if (form.typicalNeeds?.length) s += 40;
    if (form.area) s += 20;
    return s;
  }, [form]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("onboardingDraft", JSON.stringify(form));
      }
    } catch (e) {
      console.warn("Failed to write onboardingDraft to localStorage", e);
    }
  }, [form]);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "onboarding_view", ts: Date.now() })], {
          type: "application/json",
        })
      );
    }
  }, []);

  const toggleNeed = useCallback(
    (need, checked) => {
      const before = form.typicalNeeds;
      const updated = checked ? [...before, need] : before.filter((n) => n !== need);
      setForm((f) => ({ ...f, typicalNeeds: updated }));

      const snapshot = before;
      toast.custom(
        (tctx) => (
          <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 rounded border px-3 py-2 shadow">
            <span>{checked ? t("onb.added", "Dodano potrzebę") : t("onb.removed", "Usunięto potrzebę")}: {need}</span>
            <button
              onClick={() => {
                toast.dismiss(tctx.id);
                setForm((f) => ({ ...f, typicalNeeds: snapshot }));
              }}
              className="px-3 py-1.5 rounded border"
              aria-label={t("common.undo", "Cofnij")}
            >
              {t("common.undo", "Cofnij")}
            </button>
          </div>
        ),
        { duration: 5000 }
      );
    },
    [form.typicalNeeds, t]
  );

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setResult(null);
    try {
      const headers = { "Content-Type": "application/json" };
      const token =
        auth?.token ||
        auth?.authUser?.token ||
        (typeof window !== "undefined" ? window.localStorage.getItem("token") : null);
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/guest-recommendation", {
        method: "POST",
        headers,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Błąd generowania rekomendacji");
      const list = Array.isArray(data?.recommendations) ? data.recommendations : [];
      setResult(list);
      toast.success(t("onb.generated", "Wygenerowano rekomendacje"));
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon(
          "/api/audit/event",
          new Blob(
            [JSON.stringify({ type: "onboarding_generated", score: completeness, ts: Date.now() })],
            { type: "application/json" }
          )
        );
      }
    } catch (e) {
      toast.error(e.message || t("onb.error", "Błąd pobierania rekomendacji"));
    } finally {
      setLoading(false);
    }
  }, [auth?.authUser?.token, auth?.token, completeness, form, t]);

  const exportRecs = useCallback(
    (format) => {
      if (!result || !result.length) return;
      let blob;
      if (format === "csv") {
        const rows = result.map((r) => `"${String(r).replaceAll(`"`, `""`)}"`);
        blob = new Blob([rows.join("\n") + "\n"], { type: "text/csv;charset=utf-8;" });
      } else {
        blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json;charset=utf-8;" });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "csv" ? "recommendations.csv" : "recommendations.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
    [result]
  );

  return (
    <div
      className="max-w-xl mx-auto p-6 bg-white border rounded shadow-md space-y-5"
      data-screen="onboarding-path"
      data-theme={dataTheme}
    >
      <h2 className="text-xl font-bold text-center">{t("onb.title", "Zbuduj swój profil")}</h2>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{t("onb.completeness", "Kompletność profilu")}:</span>
        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">{completeness}%</span>
      </div>

      <div className="space-y-3">
        <label htmlFor="industry" className="sr-only">
          {t("onb.industry", "Branża")}
        </label>
        <select
          id="industry"
          className="w-full border p-2 rounded"
          value={form.industry}
          onChange={(e) => setForm({ ...form, industry: e.target.value })}
          aria-label={t("onb.industry", "Branża")}
        >
          <option value="">{t("onb.chooseIndustry", "Wybierz branżę...")}</option>
          <option value="budownictwo">{t("onb.const", "Budownictwo")}</option>
          <option value="eventy">{t("onb.events", "Eventy")}</option>
          <option value="transport">{t("onb.transport", "Transport")}</option>
        </select>

        <fieldset className="flex flex-wrap gap-2 text-sm">
          <legend className="sr-only">{t("onb.needs", "Typowe potrzeby")}</legend>
          {NEEDS.map((need) => {
            const checked = form.typicalNeeds.includes(need);
            return (
              <label key={need} className="inline-flex items-center gap-1 border rounded px-2 py-1">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={checked}
                  onChange={(e) => toggleNeed(need, e.target.checked)}
                />
                {need}
              </label>
            );
          })}
        </fieldset>

        <label htmlFor="area" className="sr-only">
          {t("onb.location", "Lokalizacja")}
        </label>
        <input
          id="area"
          type="text"
          placeholder={t("onb.locationPh", "Lokalizacja (np. Śląsk)")}
          value={form.area}
          onChange={(e) => setForm({ ...form, area: e.target.value })}
          className="w-full border p-2 rounded"
          aria-label={t("onb.location", "Lokalizacja")}
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-2 rounded font-medium transition"
          aria-busy={loading ? "true" : "false"}
        >
          {loading ? t("onb.loading", "Generowanie...") : t("onb.show", "Pokaż rekomendacje")}
        </button>
      </div>

      {Array.isArray(result) && result.length > 0 && (
        <div className="border-t pt-4 space-y-3">
          <h3 className="font-semibold text-center">{t("onb.suggested", "Sugerowane oferty:")}</h3>
          <ul className="list-disc ml-5 text-sm">
            {result.map((item, idx) => (
              <li key={`${item}-${idx}`}>{item}</li>
            ))}
          </ul>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => (window.location.href = "/register")}
              className="text-blue-600 underline text-sm"
            >
              {t("onb.signupCta", "Załóż konto i wypożycz teraz")}
            </button>
            <button
              onClick={() => exportRecs("csv")}
              className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
            >
              {t("common.exportCsv", "Eksport CSV")}
            </button>
            <button
              onClick={() => exportRecs("json")}
              className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
            >
              {t("common.exportJson", "Eksport JSON")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
