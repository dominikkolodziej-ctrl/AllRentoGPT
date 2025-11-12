// src/components/reservations/ReservationForm.jsx
import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { useLiveText } from "@/components/LiveTextCMS/useLiveText.js";
import { useTheme } from "@/context/ThemeContext.jsx";
import toast from "react-hot-toast";
import { createReservation } from "@/api/reservationsApi.js";

export default function ReservationForm({ offerId, unavailableDates = [], onSuccess }) {
  const [form, setForm] = useState({ name: "", from: "", to: "", message: "" });
  const [loading, setLoading] = useState(false);
  const { t } = useLiveText();
  const { theme } = useTheme() || {};

  const unavailableSet = useMemo(
    () => new Set((unavailableDates || []).map((d) => String(d).slice(0, 10))),
    [unavailableDates]
  );
  const isUnavailable = (dateStr) => dateStr && unavailableSet.has(dateStr);

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offerId) return toast.error(t("reservation.noOffer", "Brak identyfikatora oferty"));
    if (!form.from || !form.to) return toast.error(t("reservation.datesRequired", "Podaj daty od–do"));
    if (form.from > form.to) return toast.error(t("reservation.invalidRange", "Zakres dat jest nieprawidłowy"));
    if (isUnavailable(form.from) || isUnavailable(form.to)) {
      return toast.error(t("reservation.unavailable", "Wybrany termin jest niedostępny"));
    }

    try {
      setLoading(true);
      // BE: /api/reservations (plural). Używamy adaptera.
      await createReservation({
        offerId,
        startDate: new Date(form.from).toISOString(),
        endDate: new Date(form.to).toISOString(),
        note: form.message || "",
        name: form.name || "",
      });

      toast.success(t("form.success", "Rezerwacja zapisana"));
      if (typeof onSuccess === "function") onSuccess();
    } catch (err) {
      // próbujemy wyciągnąć komunikat z backendu, ale bezpiecznie fallbackujemy
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        t("form.error", "Błąd podczas zapisu rezerwacji");
      toast.error(msg);
      console.error("ReservationForm submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          {t("form.name", "Imię i nazwisko")}
        </label>
        <Input
          name="name"
          value={form.name}
          onChange={onChange}
          required
          className={`${theme?.inputBg || ""} ${theme?.border || ""} ${theme?.textPrimary || ""}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("form.dateFrom", "Data od")}
          </label>
          <Input
            type="date"
            name="from"
            value={form.from}
            onChange={onChange}
            required
            aria-invalid={isUnavailable(form.from) ? "true" : "false"}
            className={`${theme?.inputBg || ""} ${theme?.border || ""} ${theme?.textPrimary || ""}`}
          />
          {isUnavailable(form.from) && (
            <p className="text-xs text-red-600 mt-1">
              {t("reservation.unavailableFrom", "Ten dzień jest zajęty")}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("form.dateTo", "Data do")}
          </label>
          <Input
            type="date"
            name="to"
            value={form.to}
            onChange={onChange}
            required
            aria-invalid={isUnavailable(form.to) ? "true" : "false"}
            className={`${theme?.inputBg || ""} ${theme?.border || ""} ${theme?.textPrimary || ""}`}
          />
          {isUnavailable(form.to) && (
            <p className="text-xs text-red-600 mt-1">
              {t("reservation.unavailableTo", "Ten dzień jest zajęty")}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t("form.message", "Wiadomość (opcjonalnie)")}
        </label>
        <Textarea
          name="message"
          value={form.message}
          onChange={onChange}
          className={`${theme?.inputBg || ""} ${theme?.border || ""} ${theme?.textPrimary || ""}`}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className={`${theme?.buttonPrimaryBg || ""} ${theme?.buttonPrimaryText || ""}`}
        aria-busy={loading ? "true" : "false"}
      >
        {loading ? t("form.submitting", "Wysyłanie...") : t("form.submit", "Wyślij rezerwację")}
      </Button>
    </form>
  );
}

ReservationForm.propTypes = {
  offerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unavailableDates: PropTypes.arrayOf(PropTypes.string),
  onSuccess: PropTypes.func,
};
