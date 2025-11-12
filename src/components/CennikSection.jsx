import React from "react";
import { FaCrown, FaRocket, FaStar } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext.jsx";
import { useLiveText } from "@/components/LiveTextCMS/useLiveText.js";

const CennikSection = () => {
  const { theme } = useTheme() || {};
  const { t } = useLiveText?.() || { t: (k) => k };

  return (
    <section
      className={
        theme?.pricing?.container ||
        "bg-gray-50 rounded-2xl p-6 shadow-sm mt-12"
      }
    >
      <h2
        className={
          theme?.pricing?.title || "text-xl font-semibold mb-4"
        }
      >
        {t("pricing.promotePlans.title") || "Plany promowania ofert"}
      </h2>
      <div
        className={
          theme?.pricing?.grid || "grid sm:grid-cols-3 gap-6"
        }
      >
        <div className={theme?.pricing?.item || "flex items-start gap-3"}>
          <FaStar
            className={
              theme?.pricing?.iconStar || "text-yellow-500 text-xl mt-1"
            }
          />
          <div>
            <p className={theme?.pricing?.itemTitle || "font-medium"}>
              {t("pricing.promotePlans.highlight") ||
                "Wyróżnienie ogłoszenia"}
            </p>
            <p
              className={
                theme?.pricing?.itemDesc || "text-sm text-gray-600"
              }
            >
              {t("pricing.promotePlans.highlightDesc") ||
                "Wyróżnij swoją ofertę wizualnie i zwiększ widoczność"}
            </p>
          </div>
        </div>
        <div className={theme?.pricing?.item || "flex items-start gap-3"}>
          <FaRocket
            className={
              theme?.pricing?.iconRocket || "text-blue-500 text-xl mt-1"
            }
          />
          <div>
            <p className={theme?.pricing?.itemTitle || "font-medium"}>
              {t("pricing.promotePlans.homepage") ||
                "Promowanie na stronie głównej"}
            </p>
            <p
              className={
                theme?.pricing?.itemDesc || "text-sm text-gray-600"
              }
            >
              {t("pricing.promotePlans.homepageDesc") ||
                'Twoje ogłoszenie trafi do sekcji „Promowane”'}
            </p>
          </div>
        </div>
        <div className={theme?.pricing?.item || "flex items-start gap-3"}>
          <FaCrown
            className={
              theme?.pricing?.iconCrown || "text-purple-600 text-xl mt-1"
            }
          />
          <div>
            <p className={theme?.pricing?.itemTitle || "font-medium"}>
              {t("pricing.promotePlans.subscriptions") ||
                "Pakiety subskrypcyjne"}
            </p>
            <p
              className={
                theme?.pricing?.itemDesc || "text-sm text-gray-600"
              }
            >
              {t("pricing.promotePlans.subscriptionsDesc") ||
                "Dostosuj plan promocji do swoich potrzeb"}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <a
          href="/plans"
          className={
            theme?.pricing?.link ||
            "inline-block text-sm text-blue-600 hover:underline"
          }
        >
          {t("pricing.promotePlans.viewAll") || "Zobacz wszystkie plany"}
        </a>
      </div>
    </section>
  );
};

export default CennikSection;
