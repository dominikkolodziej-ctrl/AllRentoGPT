// src/components/OfferCard.jsx
import React, { memo, useMemo } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useLiveText } from "@/components/LiveTextCMS/useLiveText.js";
import { useTheme } from "@/context/ThemeContext.jsx";

const OfferCard = ({ offer, className = "" }) => {
  const { t } = useLiveText();
  const { theme } = useTheme();

  const cid = offer?._id || offer?.id || "";
  const title = useMemo(() => String(offer?.title ?? t("common.noTitle", "Bez tytułu")), [offer?.title, t]);

  const isB2B =
    Boolean(offer?.b2bOnly) ||
    (Array.isArray(offer?.tags) && offer.tags.map(String).map((s) => s.toLowerCase()).includes("b2b"));

  const containerCls = `${theme?.card ?? "p-4 rounded-lg shadow bg-white border border-gray-200"} ${className}`.trim();
  const titleCls = theme?.cardTitle ?? "text-base font-semibold text-gray-900";
  const badgeCls = theme?.badge ?? "ml-2 inline-block px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800";
  const metaCls = theme?.textSecondary ?? "text-sm text-gray-600";

  const currency = offer?.currency || "PLN";
  const priceText =
    offer?.price != null
      ? new Intl.NumberFormat(undefined, { style: "currency", currency, currencyDisplay: "narrowSymbol" })
          .format(Number(offer.price))
      : t("offers.grid.noPrice", "Cena na zapytanie");

  return (
    <article className={containerCls} data-offer-id={cid} role="article">
      <h3 className={titleCls}>
        <Link to={`/offers/${cid}`} className="hover:underline">
          {title}
        </Link>
        {isB2B && (
          <span className={badgeCls} aria-label={t("offer.b2bOnly.badge", "B2B")}>
            {t("offer.b2bOnly.badge", "B2B")}
          </span>
        )}
      </h3>
      {offer?.description && <p className={metaCls}>{offer.description}</p>}
      <p className={metaCls}>
        {t("common.price", "Cena")}: <strong>{priceText}</strong>
      </p>
    </article>
  );
};

OfferCard.propTypes = {
  offer: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    currency: PropTypes.string,
    b2bOnly: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  className: PropTypes.string,
};

export default memo(OfferCard);
