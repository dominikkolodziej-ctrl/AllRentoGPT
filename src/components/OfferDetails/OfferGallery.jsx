// src/components/OfferDetails/OfferGallery.jsx
import React, { memo } from "react";
import PropTypes from "prop-types";
import { useLiveText } from "@/components/LiveTextCMS/useLiveText.js";
import { useTheme } from "@/context/ThemeContext.jsx";

const OfferGallery = ({ images }) => {
  const { t } = useLiveText();
  const { theme } = useTheme();

  const list = Array.isArray(images) ? images : [];

  if (list.length === 0) {
    return (
      <p className={`${theme?.textSecondary || "text-gray-500"} italic`}>
        {t("offers.gallery.empty", "Brak zdjęć.")}
      </p>
    );
  }

  // obsługujemy zarówno stringi, jak i obiekty {url}
  const toSrc = (item) => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") return item.url || item.src || "";
    return "";
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {list.map((item, idx) => {
        const src = toSrc(item);
        if (!src) return null;
        return (
          <img
            key={`${src}-${idx}`}
            src={src}
            alt={`${t("offers.gallery.image", "Zdjęcie")} ${idx + 1}`}
            className={`h-32 w-full object-cover rounded shadow ${theme?.border || ""}`}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        );
      })}
    </div>
  );
};

OfferGallery.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({ url: PropTypes.string, src: PropTypes.string }),
    ])
  ),
};

export default memo(OfferGallery);
