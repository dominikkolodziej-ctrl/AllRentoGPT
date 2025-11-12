// src/components/reservations/ReservationModal.jsx
import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@/context/ThemeContext.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog.jsx";
import { useLiveText } from "@/components/LiveTextCMS/useLiveText.js";
import ReservationForm from "@/components/reservations/ReservationForm.jsx";

export default function ReservationModal({ isOpen, onClose, offerId, unavailableDates = [] }) {
  const { theme } = useTheme() || {};
  const { t } = useLiveText();

  const handleOpenChange = (v) => {
    // zamknięcie modala z krzyżyka / ESC / klik poza
    if (!v && typeof onClose === "function") onClose();
  };

  return (
    <Dialog open={!!isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`${theme?.modal || ""} max-w-lg rounded-2xl p-0`}
        aria-label={t("reservation.modal.ariaLabel", "Okno rezerwacji")}
      >
        <DialogHeader>
          <DialogTitle>
            {t("reservation.title", "Rezerwacja oferty")}
          </DialogTitle>
        </DialogHeader>

        <ReservationForm
          offerId={offerId}
          unavailableDates={Array.isArray(unavailableDates) ? unavailableDates : []}
          onSuccess={onClose}
        />

        <DialogFooter>
          <button
            className={`${theme?.buttonOutline || ""} px-3 py-1.5 rounded-xl mt-4`}
            onClick={onClose}
            type="button"
            aria-label={t("reservation.cancel", "Anuluj")}
          >
            {t("reservation.cancel", "Anuluj")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

ReservationModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  offerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  // backend zwraca ISO-stringi dat lub zakresy; na froncie trzymamy listę stringów
  unavailableDates: PropTypes.arrayOf(PropTypes.string),
};
