import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";

// MOCK – docelowo dane z backendu
const mockCompany = {
  companyName: "Tech Solutions Sp. z o.o.",
  description: "Specjalizujemy się w wynajmie sprzętu IT i oprogramowania.",
  logo: "https://via.placeholder.com/120x120.png?text=Logo",
  banner: null,
  offers: [
    { title: "Laptop Dell XPS", description: "Wydajny laptop do pracy", price: "300 zł/dzień" },
    { title: "Serwer NAS QNAP", description: "Do przechowywania danych", price: "150 zł/dzień" },
  ],
};

const CompanyProfile = () => {
  const { id } = useParams();
  const live = useLiveText();
  const t = (k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k);

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;

  const ui = useMemo(
    () => ({
      page: `bg-white shadow ${theme?.classes?.page || ""}`.trim(),
      bannerWrap: "w-full h-60 md:h-80 overflow-hidden",
      bannerImg: "w-full h-full object-cover",
      container: `max-w-6xl mx-auto p-6 ${theme?.classes?.container || ""}`.trim(),
      logo: "w-28 h-28 object-cover rounded-full border-4 border-white shadow -mt-16 md:mt-0",
      offerCard: "bg-gray-100 rounded-lg p-4 shadow",
      title: "text-3xl font-bold text-blue-800",
      subtitle: "mt-2 text-gray-600",
      offersTitle: "text-2xl font-bold mb-4 text-blue-700",
    }),
    [theme]
  );

  const company = mockCompany;
  const randomBanner = `https://source.unsplash.com/1600x400/?office,technology,workspace&sig=${encodeURIComponent(
    id || "0"
  )}`;

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "company_profile_view", id: id || null, ts: Date.now() })], {
          type: "application/json",
        })
      );
    }
  }, [id]);

  return (
    <div className={ui.page} data-screen="company-profile" data-theme={dataTheme}>
      <div className={ui.bannerWrap}>
        <img
          src={company.banner || randomBanner}
          alt={t("company.bannerAlt", "Baner firmy")}
          className={ui.bannerImg}
          loading="lazy"
        />
      </div>

      <div className={ui.container}>
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <img
            src={company.logo}
            alt={t("company.logoAlt", "Logo firmy")}
            className={ui.logo}
            loading="lazy"
          />
          <div>
            <h1 className={ui.title}>{company.companyName}</h1>
            <p className={ui.subtitle}>{company.description}</p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className={ui.offersTitle}>{t("company.offersTitle", "Oferty tej firmy")}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {company.offers.map((offer, idx) => (
              <div key={`${offer.title}-${idx}`} className={ui.offerCard}>
                <h3 className="text-lg font-semibold text-blue-700">{offer.title}</h3>
                <p className="text-sm mt-1">{offer.description}</p>
                <p className="text-sm mt-2 font-semibold">{offer.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
