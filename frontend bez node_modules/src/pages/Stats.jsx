// src/pages/Stats.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import { useTheme } from "@/context/ThemeContext.jsx";

const sampleViewsData = {
  "7dni": [
    { day: "Pon", views: 120 },
    { day: "Wt", views: 180 },
    { day: "Śr", views: 75 },
    { day: "Czw", views: 200 },
    { day: "Pt", views: 90 },
    { day: "Sob", views: 40 },
    { day: "Ndz", views: 60 },
  ],
  "30dni": Array.from({ length: 30 }, (_, i) => ({
    day: `Dzień ${i + 1}`,
    views: Math.floor(Math.random() * 200),
  })),
  "90dni": Array.from({ length: 90 }, (_, i) => ({
    day: `Dzień ${i + 1}`,
    views: Math.floor(Math.random() * 250),
  })),
};

const sampleMessagesData = [
  { name: "Oferta 1", messages: 3 },
  { name: "Oferta 2", messages: 0 },
  { name: "Oferta 3", messages: 6 },
  { name: "Oferta 4", messages: 0 },
];

const sampleOffers = [
  {
    id: 1,
    title: "Oferta 1",
    views: 120,
    createdAt: Date.now() - 86400000 * 5,
    firstMessageAt: Date.now() - 86400000 * 3,
  },
  {
    id: 2,
    title: "Oferta 2",
    views: 0,
    createdAt: Date.now() - 86400000 * 10,
    firstMessageAt: null,
  },
  {
    id: 3,
    title: "Oferta 3",
    views: 75,
    createdAt: Date.now() - 86400000 * 4,
    firstMessageAt: Date.now() - 86400000 * 1,
  },
  {
    id: 4,
    title: "Oferta 4",
    views: 0,
    createdAt: Date.now() - 86400000 * 7,
    firstMessageAt: null,
  },
];

const Stats = () => {
  const [range, setRange] = useState("7dni");
  const [startDate, setStartDate] = useState(() => new Date());
  const [endDate, setEndDate] = useState(() => new Date());

  const live = useLiveText();
  const t = useCallback(
    (k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k),
    [live]
  );

  const theme = useTheme?.();
  const dataTheme =
    (theme && (theme.theme || theme.current || theme.name || theme.mode)) || undefined;

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/audit/event",
        new Blob([JSON.stringify({ type: "stats_view", ts: Date.now() })], {
          type: "application/json",
        })
      );
    }
  }, []);

  const offersWithoutInteraction = useMemo(
    () => sampleOffers.filter((o) => o.views === 0).length,
    []
  );

  const avgResponseTimeDays = useMemo(() => {
    const responseTimes = sampleOffers
      .filter((o) => o.firstMessageAt)
      .map((o) => o.firstMessageAt - o.createdAt);
    const avgResponseTimeMs =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : null;
    return avgResponseTimeMs
      ? Math.round(avgResponseTimeMs / (1000 * 60 * 60 * 24))
      : "brak danych";
  }, []);

  const totals = useMemo(() => {
    const totalViews = sampleOffers.reduce((a, b) => a + b.views, 0);
    const totalMessages = sampleMessagesData.reduce((a, b) => a + b.messages, 0);
    const ctr = totalViews > 0 ? ((totalMessages / totalViews) * 100).toFixed(1) : "0.0";
    return { totalViews, totalMessages, ctr };
  }, []);

  const exportData = useCallback(
    (format) => {
      const payload = {
        range,
        views: sampleViewsData[range],
        messages: sampleMessagesData,
        summary: {
          totalViews: totals.totalViews,
          totalMessages: totals.totalMessages,
          ctr: totals.ctr,
          offersWithoutInteraction,
          avgResponseTimeDays,
          startDate,
          endDate,
        },
      };
      let blob;
      if (format === "csv") {
        const header = ["day", "views"];
        const csv =
          ["#views", header.join(","), ...payload.views.map((r) => `${r.day},${r.views}`)].join("\n") +
          "\n\n" +
          ["#messages", "name,messages", ...payload.messages.map((m) => `${m.name},${m.messages}`)].join("\n");
        blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      } else {
        blob = new Blob([JSON.stringify(payload, null, 2)], {
          type: "application/json;charset=utf-8;",
        });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "csv" ? "stats_export.csv" : "stats_export.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
    [avgResponseTimeDays, endDate, offersWithoutInteraction, range, startDate, totals]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-16" data-theme={dataTheme} data-screen="stats">
      <h1 className="text-4xl font-bold text-blue-700 mb-12 text-center">
        {t("stats.title", "Statystyki Twoich Ofert")}
      </h1>

      <div className="flex flex-wrap items-center gap-4 justify-center mb-6">
        <button
          className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50"
          onClick={() => exportData("csv")}
          aria-label={t("common.exportCsv", "Eksport CSV")}
        >
          {t("common.exportCsv", "Eksport CSV")}
        </button>
        <button
          className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50"
          onClick={() => exportData("json")}
          aria-label={t("common.exportJson", "Eksport JSON")}
        >
          {t("common.exportJson", "Eksport JSON")}
        </button>
      </div>

      <div className="flex flex-wrap gap-4 justify-center mb-10">
        {["7dni", "30dni", "90dni"].map((label) => (
          <button
            key={label}
            onClick={() => setRange(label)}
            className={`px-4 py-2 rounded-lg border ${
              range === label ? "bg-blue-600 text-white" : "bg-white text-blue-600"
            }`}
            aria-pressed={range === label}
          >
            {t("stats.last", "Ostatnie")} {label.replace("dni", " dni")}
          </button>
        ))}
        <div className="flex items-center gap-2">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="p-2 border rounded"
            aria-label={t("stats.from", "Od")}
          />
          <span className="text-gray-600">–</span>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            className="p-2 border rounded"
            aria-label={t("stats.to", "Do")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
        <StatTile
          title={t("stats.views", "Wyświetlenia")}
          value={totals.totalViews}
          color="blue"
          tooltip={t(
            "stats.viewsTip",
            "Łączna liczba wyświetleń Twoich ofert w wybranym okresie"
          )}
        />
        <StatTile
          title={t("stats.messages", "Wiadomości")}
          value={totals.totalMessages}
          color="blue"
          tooltip={t("stats.msgTip", "Ilość wysłanych do Ciebie wiadomości")}
        />
        <StatTile
          title="CTR"
          value={`${totals.ctr}%`}
          color="green"
          tooltip={t(
            "stats.ctrTip",
            "CTR (Click-Through Rate) = kliknięcia ÷ wyświetlenia. Pokazuje skuteczność oferty"
          )}
        />
        <StatTile
          title={t("stats.noInteraction", "Bez interakcji")}
          value={offersWithoutInteraction}
          color="red"
          tooltip={t(
            "stats.noInteractionTip",
            "Oferty, które nie miały żadnych kliknięć ani wiadomości"
          )}
        />
        <StatTile
          title={t("stats.avgResp", "Śr. czas reakcji")}
          value={
            avgResponseTimeDays !== "brak danych"
              ? `${avgResponseTimeDays} ${t("stats.days", "dni")}`
              : avgResponseTimeDays
          }
          color="gray"
          tooltip={t(
            "stats.avgRespTip",
            "Średni czas od publikacji oferty do pierwszego kontaktu od klienta"
          )}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            {t("stats.viewsChart", "Wyświetlenia")}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sampleViewsData[range]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            {t("stats.msgChart", "Wiadomości wg ofert")}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sampleMessagesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="messages" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-16 text-sm text-gray-500 text-center max-w-2xl mx-auto">
        🔍 {t(
          "stats.inspo",
          "Inspiracja: OLX, Vinted, Amazon Seller, Booking – statystyki pomagają firmom w mierzeniu skuteczności, wychwytywaniu nieaktywnych ofert i podejmowaniu decyzji biznesowych. B2B Rental dostarcza te same narzędzia."
        )}
      </div>
    </div>
  );
};

const StatTile = ({ title, value, color, tooltip }) => (
  <div className="bg-white p-4 rounded-lg shadow border text-center relative" title={tooltip}>
    <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
    <p
      className={`text-2xl font-bold ${
        color === "red"
          ? "text-red-500"
          : color === "green"
          ? "text-green-600"
          : color === "gray"
          ? "text-gray-700"
          : "text-blue-700"
      }`}
    >
      {value}
    </p>
  </div>
);

StatTile.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.oneOf(["red", "green", "blue", "gray"]),
  tooltip: PropTypes.string,
};

export default Stats;
