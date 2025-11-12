// src/components/OfferDetails/OfferSpecsList.jsx
import React, { memo } from "react";
import PropTypes from "prop-types";
import AlertTag from "@/components/common/AlertTag.jsx";
import { useLiveText } from "@/components/LiveTextCMS/useLiveText.js";
import { useTheme } from "@/context/ThemeContext.jsx";

const OfferSpecsList = ({ offer }) => {
  const { t } = useLiveText();
  const { theme } = useTheme();

  if (!offer) {
    return (
      <p className={`${theme?.textSecondary || "text-gray-500"} italic`}>
        {t("offers.specs.empty", "Brak danych oferty.")}
      </p>
    );
  }

  const row = (label, value) => (
    <div className="flex items-center justify-between py-1">
      <span className={theme?.textSecondary || "text-gray-600"} aria-label="label">
        {label}
      </span>
      <span className={theme?.textPrimary || "text-gray-900"} aria-label="value">
        {value}
      </span>
    </div>
  );

  const priceText =
    offer.price != null
      ? `${offer.price} ${offer.currency || "PLN"}`
      : t("offers.specs.noPrice", "Na zapytanie");

  const locationText = (() => {
    const loc = offer.location;
    if (!loc) return null;
    if (typeof loc === "string") return loc;
    return loc.address || loc.city || "";
  })();

  return (
    <div
      className={`${theme?.cardBg || "bg-white"} ${theme?.border || "border"} rounded p-4 space-y-2`}
      data-component="offer-specs-list"
    >
      {row(t("offers.specs.price", "Cena"), priceText)}
      {offer.year != null && row(t("offers.specs.year", "Rok"), offer.year)}
      {locationText && row(t("offers.specs.location", "Lokalizacja"), locationText)}
      {offer.status && row(t("offers.specs.status", "Status"), offer.status)}

      {Array.isArray(offer.aiTags) && offer.aiTags.length > 0 && (
        <div className="pt-2">
          <div className="mb-1 text-sm font-medium">
            {t("offers.specs.aiTags", "Tagi AI")}
          </div>
          <div className="flex flex-wrap gap-1">
            {offer.aiTags.map((tg, i) => (
              <AlertTag key={`${tg}-${i}`} text={tg} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

OfferSpecsList.propTypes = {
  offer: PropTypes.shape({
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    currency: PropTypes.string, // ✅ domknięte – znika ostrzeżenie ESLinta
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    location: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({ address: PropTypes.string, city: PropTypes.string }),
    ]),
    status: PropTypes.string,
    aiTags: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default memo(OfferSpecsList);
