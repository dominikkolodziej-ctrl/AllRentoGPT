// src/components/ReservationStatusTimeline.jsx
import React, { memo, useMemo } from "react";
import PropTypes from "prop-types";
import { useLiveText } from "@/components/LiveTextCMS/useLiveText.js";
import { useTheme } from "@/context/ThemeContext.jsx";

// Normalizacja statusów → slug używany w BE
const mapToSlug = (v) => {
  const s = String(v || "").trim().toLowerCase();
  const dict = {
    // EN → PL slugi (kompat)
    pending: "oczekuje",
    confirmed: "potwierdzona",
    cancelled: "anulowana",
    completed: "zakonczona",

    // PL „Maks”
    oczekuje: "oczekuje",
    umowa_wyslana: "umowa_wyslana",
    umowa_podpisana: "umowa_podpisana",
    gotowe_do_odbioru: "gotowe_do_odbioru",
    zakonczona: "zakonczona",
    niezwrocona: "niezwrocona",
    zwrot_potwierdzony: "zwrot_potwierdzony",
    anulowana: "anulowana",

    // drobne warianty
    potwierdzona: "potwierdzona",
    gotowa: "gotowe_do_odbioru",
  };
  return dict[s] || s;
};

// Domyślna ścieżka postępu (krótka)
const defaultSteps = [
  "oczekuje",
  "potwierdzona",
  "gotowe_do_odbioru",
  "zakonczona",
];

// Labelki (można nadpisać props.labels)
const defaultLabels = {
  oczekuje: "Oczekuje",
  potwierdzona: "Potwierdzona",
  umowa_wyslana: "Umowa wysłana",
  umowa_podpisana: "Umowa podpisana",
  gotowe_do_odbioru: "Gotowe do odbioru",
  zakonczona: "Zakończona",
  niezwrocona: "Niezwrócona",
  zwrot_potwierdzony: "Zwrot potwierdzony",
  anulowana: "Anulowana",
};

const ReservationStatusTimeline = ({
  status,
  steps = defaultSteps,
  labels = defaultLabels,
  className = "",
}) => {
  const { t } = useLiveText();
  const { theme } = useTheme();

  const normSteps = useMemo(() => steps.map(mapToSlug), [steps]);
  const normStatus = useMemo(() => mapToSlug(status), [status]);
  const currentIndex = useMemo(() => normSteps.indexOf(normStatus), [normSteps, normStatus]);

  const containerCls = `flex items-center justify-between w-full max-w-2xl mx-auto py-4 ${className}`;
  const dotActive = theme?.timelineDotActive ?? "bg-green-500 border-green-500";
  const dotInactive = theme?.timelineDotInactive ?? "border-gray-300";
  const textActive = theme?.timelineTextActive ?? "text-green-600 font-semibold";
  const textInactive = theme?.timelineTextInactive ?? "text-gray-400";

  return (
    <div
      className={containerCls}
      role="list"
      aria-label={t("reservation.status.progress", "Postęp rezerwacji")}
    >
      {normSteps.map((step, idx) => {
        const isActive = currentIndex !== -1 && currentIndex >= idx;
        const rawLabel = labels[step] || defaultLabels[step] || step;
        const label = t(`reservation.status.${step}`, rawLabel);
        return (
          <div key={`${step}-${idx}`} className="flex flex-col items-center text-center w-full" role="listitem">
            <div
              className={`rounded-full w-6 h-6 border-2 mb-2 ${isActive ? dotActive : dotInactive}`}
              aria-hidden="true"
            />
            <span
              className={`text-xs ${isActive ? textActive : textInactive}`}
              aria-current={currentIndex === idx ? "step" : undefined}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

ReservationStatusTimeline.propTypes = {
  status: PropTypes.string.isRequired,
  steps: PropTypes.arrayOf(PropTypes.string),
  labels: PropTypes.objectOf(PropTypes.string),
  className: PropTypes.string,
};

export { ReservationStatusTimeline };
export default memo(ReservationStatusTimeline);
