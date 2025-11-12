import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLiveText } from "@/components/LiveTextCMS/useLiveText.js";
import { useTheme } from "@/context/ThemeContext.jsx";

const ABTestDashboard = () => {
  const live = useLiveText("admin");
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const { theme } = useTheme?.() || {};
  const pageClass = useMemo(
    () => `p-6 ${theme?.bgCard || ""} ${theme?.textPrimary || ""}`.trim(),
    [theme]
  );

  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/ab-test")
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={pageClass}>
      <h2 className="text-lg font-bold mb-4">{t("abtest.title", "🧪 Statystyki A/B Testów")}</h2>

      {loading && <p>{t("loading", "Ładowanie...")}</p>}
      {error && <p className="text-red-500">{t("error.abtest", "Błąd pobierania danych.")}</p>}
      {!loading && !error && data.length === 0 && <p>{t("empty.abtest", "Brak danych testowych.")}</p>}

      <ul className="text-sm space-y-2">
        {data.map((item, idx) => (
          <li key={idx}>
            <strong>{item.experiment}</strong>: A = {item.aClicks}, B = {item.bClicks}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ABTestDashboard;
