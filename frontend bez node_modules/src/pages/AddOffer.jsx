import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AIInspectorPanel from "@/components/common/AIInspectorPanel.jsx";
import { useAuth } from "@/context/AuthContext.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";

const AddOffer = () => {
  const { authUser, token } = useAuth();
  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;
  const ui = useMemo(
    () => ({
      page: `space-y-6 p-6 max-w-3xl mx-auto ${theme?.classes?.page || ""}`.trim(),
      field: "space-y-1",
      label: "text-sm font-medium",
      input: "",
      row: "grid grid-cols-1 md:grid-cols-2 gap-4",
      actions: "flex gap-2 flex-wrap",
      hint: `text-xs text-gray-500 ${theme?.classes?.mutedText || ""}`.trim(),
      btn: `px-3 py-2 rounded border ${theme?.classes?.button || ""}`.trim(),
      btnPrimary: `btn btn-primary ${theme?.classes?.button || ""}`.trim(),
      btnSecondary: `btn btn-secondary ${theme?.classes?.button || ""}`.trim(),
      card: `rounded border p-4 ${theme?.classes?.card || ""}`.trim(),
    }),
    [theme]
  );

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    audienceType: "",
    priority: "",
    aiTag: "",
    planId: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const draftTimerRef = useRef(null);
  const undoTimerRef = useRef(null);

  const authHeader = useMemo(() => {
    const tkn =
      token ||
      authUser?.token ||
      (typeof window !== "undefined" ? window.localStorage.getItem("token") : null);
    return tkn ? { Authorization: `Bearer ${tkn}` } : {};
  }, [token, authUser?.token]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("addOfferDraft") : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setForm((f) => ({ ...f, ...parsed }));
        }
      }
    } catch (e) {
      console.warn("Draft restore failed", e);
    }
  }, []);

  useEffect(() => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("addOfferDraft", JSON.stringify(form));
        }
      } catch (e) {
        console.warn("Draft save failed", e);
      }
      draftTimerRef.current = null;
    }, 500);
    return () => {
      if (draftTimerRef.current) {
        clearTimeout(draftTimerRef.current);
        draftTimerRef.current = null;
      }
    };
  }, [form]);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "add_offer_view", ts: Date.now() })], {
          type: "application/json",
        })
      );
    }
  }, []);

  const onChange = useCallback((key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const validate = useCallback(() => {
    const errs = [];
    if (!form.title.trim()) errs.push(t("offer.titleRequired", "Tytuł jest wymagany"));
    if (!form.description.trim()) errs.push(t("offer.descriptionRequired", "Opis jest wymagany"));
    if (form.price !== "" && isNaN(Number(form.price))) errs.push(t("offer.priceNumeric", "Cena musi być liczbą"));
    return errs;
  }, [form, t]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errs = validate();
      if (errs.length) {
        errs.forEach((msg) => toast.error(msg));
        return;
      }
      setSubmitting(true);
      const tid = "offer_submit";
      try {
        toast.loading(t("offer.submitting", "Dodaję ofertę..."), { id: tid });
        const payload = {
          ...form,
          price: form.price === "" ? null : Number(form.price),
        };
        const res = await axios.post("/api/offer", payload, {
          headers: { ...authHeader, "Content-Type": "application/json" },
        });
        const created = res?.data || {};
        toast.success(t("offer.added", "Oferta dodana!"), { id: tid });

        try {
          if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
            navigator.sendBeacon(
              "/api/audit/event",
              new Blob(
                [JSON.stringify({ type: "offer_created", id: created._id || created.id, ts: Date.now() })],
                { type: "application/json" }
              )
            );
          }
        } catch (e2) {
          console.warn("Audit beacon failed", e2);
        }

        setForm({
          title: "",
          description: "",
          price: "",
          audienceType: "",
          priority: "",
          aiTag: "",
          planId: "",
        });
        try {
          if (typeof window !== "undefined") window.localStorage.removeItem("addOfferDraft");
        } catch (e3) {
          console.warn("Draft clear failed", e3);
        }

        const undo = () => {
          if (!created?._id && !created?.id) return;
          axios
            .delete(`/api/offer/${created._id || created.id}`, { headers: authHeader })
            .then(() => toast.success(t("offer.undoSuccess", "Cofnięto dodanie oferty")))
            .catch(() => toast.error(t("offer.undoFail", "Nie udało się cofnąć dodania")));
        };

        const toastId = toast.custom(
          (tctx) => (
            <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 rounded border px-3 py-2 shadow">
              <span>{t("offer.created", "Oferta utworzona")}</span>
              <button
                className={ui.btn}
                onClick={() => {
                  toast.dismiss(tctx.id);
                  undo();
                }}
                aria-label={t("common.undo", "Cofnij")}
              >
                {t("common.undo", "Cofnij")}
              </button>
            </div>
          ),
          { duration: 5000 }
        );

        undoTimerRef.current = setTimeout(() => {
          if (toastId) toast.dismiss(toastId);
          undoTimerRef.current = null;
        }, 5000);
      } catch {
        toast.error(t("offer.addError", "Błąd dodawania oferty."), { id: tid });
      } finally {
        setSubmitting(false);
      }
    },
    [authHeader, form, t, ui.btn, validate]
  );

  const exportJSON = useCallback(() => {
    const data = JSON.stringify(form, null, 2);
    const blob = new Blob([data], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "offer_draft.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [form]);

  const fileRef = useRef(null);
  const importJSON = useCallback(
    (file) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const obj = JSON.parse(String(reader.result || "{}"));
          setForm((f) => ({ ...f, ...obj }));
          toast.success(t("common.imported", "Zaimportowano dane"));
        } catch {
          toast.error(t("common.importError", "Nieprawidłowy plik JSON"));
        }
      };
      reader.readAsText(file);
    },
    [t]
  );

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
    };
  }, []);

  const aiResult = useMemo(() => {
    const titleLen = (form.title || "").trim().length;
    const descLen = (form.description || "").trim().length;
    const hasPrice = form.price !== "" && !isNaN(Number(form.price));
    let score = 50;
    const flags = [];
    if (titleLen >= 30) score += 10;
    else flags.push("short_title");
    if (descLen >= 160) score += 25;
    else flags.push("short_description");
    if (hasPrice) score += 15;
    else flags.push("missing_price");
    if (form.audienceType) score += 5;
    if (form.priority) score += 5;
    const tier = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : "D";
    return { qualityScore: Math.min(100, score), tier, flags };
  }, [form]);

  if (!authUser) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className={ui.page}
      data-screen="add-offer"
      data-onboarding-id="add-offer"
      data-theme={dataTheme}
    >
      <h1 className="text-2xl font-semibold">🧩 {t("offer.addTitle", "Dodaj ofertę")}</h1>

      <div className={ui.card}>
        <div className={ui.field}>
          <label htmlFor="title" className={ui.label}>
            {t("offer.title", "Tytuł")}
          </label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder={t("offer.titlePh", "np. Wózek widłowy 3.5T")}
            aria-required="true"
          />
          <p className={ui.hint}>{t("offer.titleHint", "Min. 30 znaków dla lepszej jakości")}</p>
        </div>

        <div className={ui.field}>
          <label htmlFor="description" className={ui.label}>
            {t("offer.description", "Opis")}
          </label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder={t("offer.descriptionPh", "Szczegółowy opis oferty...")}
            rows={6}
            aria-required="true"
          />
        </div>

        <div className={ui.row}>
          <div className={ui.field}>
            <label htmlFor="price" className={ui.label}>
              {t("offer.price", "Cena (PLN/dzień)")}
            </label>
            <Input
              id="price"
              value={form.price}
              onChange={(e) => onChange("price", e.target.value)}
              placeholder="100"
              inputMode="decimal"
              aria-describedby="price-help"
            />
            <p id="price-help" className={ui.hint}>
              {t("offer.priceHint", "Tylko cyfry, bez waluty")}
            </p>
          </div>

          <div className={ui.field}>
            <label htmlFor="audienceType" className={ui.label}>
              {t("offer.audience", "Grupa docelowa")}
            </label>
            <Input
              id="audienceType"
              value={form.audienceType}
              onChange={(e) => onChange("audienceType", e.target.value)}
              placeholder={t("offer.audiencePh", "np. Budownictwo, Logistyka")}
            />
          </div>
        </div>

        <div className={ui.row}>
          <div className={ui.field}>
            <label htmlFor="priority" className={ui.label}>
              {t("offer.priority", "Priorytet")}
            </label>
            <Input
              id="priority"
              value={form.priority}
              onChange={(e) => onChange("priority", e.target.value)}
              placeholder={t("offer.priorityPh", "np. high/medium/low")}
            />
          </div>

          <div className={ui.field}>
            <label htmlFor="planId" className={ui.label}>
              {t("offer.planId", "Plan (ID)")}
            </label>
            <Input
              id="planId"
              value={form.planId}
              onChange={(e) => onChange("planId", e.target.value)}
              placeholder="plan_basic"
            />
          </div>
        </div>

        <div className={ui.field}>
          <label htmlFor="aiTag" className={ui.label}>
            {t("offer.aiTag", "AI tag")}
          </label>
          <Input
            id="aiTag"
            value={form.aiTag}
            onChange={(e) => onChange("aiTag", e.target.value)}
            placeholder="auto"
          />
        </div>
      </div>

      <div className={ui.card}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="text-lg font-medium">AI Inspector</span>
          <div className={ui.actions}>
            <Button
              type="button"
              className={ui.btn}
              onClick={exportJSON}
              aria-label={t("common.exportJson", "Eksportuj JSON")}
            >
              {t("common.exportJson", "Eksport JSON")}
            </Button>
            <Button
              type="button"
              className={ui.btn}
              onClick={() => fileRef.current?.click()}
              aria-label={t("common.importJson", "Importuj JSON")}
            >
              {t("common.importJson", "Import JSON")}
            </Button>
            <input
              type="file"
              ref={fileRef}
              accept="application/json"
              className="hidden"
              onChange={(e) => importJSON(e.target.files?.[0] || null)}
            />
          </div>
        </div>
        <div className="mt-3">
          <AIInspectorPanel result={aiResult} />
          <p className={ui.hint}>
            {t(
              "ai.note",
              "Wynik AI obliczany lokalnie — uzupełnij tytuł, opis i cenę, aby poprawić jakość."
            )}
          </p>
        </div>
      </div>

      <div className={ui.actions}>
        <Button
          type="submit"
          className={ui.btnPrimary}
          disabled={submitting}
          aria-busy={submitting ? "true" : "false"}
          aria-label={t("offer.submit", "Dodaj")}
        >
          {submitting ? t("common.saving", "Zapisywanie...") : t("offer.submit", "Dodaj")}
        </Button>
        <Button
          type="button"
          className={ui.btnSecondary}
          onClick={() =>
            setForm({
              title: "",
              description: "",
              price: "",
              audienceType: "",
              priority: "",
              aiTag: "",
              planId: "",
            })
          }
          aria-label={t("common.clear", "Wyczyść")}
        >
          {t("common.clear", "Wyczyść")}
        </Button>
      </div>
    </form>
  );
};

export default AddOffer;
