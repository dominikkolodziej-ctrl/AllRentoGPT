// Ścieżka: src/components/admin/FirmBenchmarkDashboard.jsx
import React, { useContext } from 'react';
import { useFirmAnalytics } from '@/hooks/useFirmAnalytics.js'; // ✅ FAZA 8
import FirmPositionTag from "@/components/admin/FirmPositionTag.jsx";
import { useLiveText } from "@/components/LiveTextCMS/useLiveText.js"; // ✅ FAZA 1
import { ThemeContext } from "@/context/ThemeContext.jsx"; // ✅ FAZA 9

const FirmBenchmarkDashboard = () => {
  const { t } = useLiveText(); // ✅ FAZA 1
  const { theme } = useContext(ThemeContext); // ✅ FAZA 9
  const data = useFirmAnalytics();

  if (!data)
    return (
      <p className="text-sm italic text-gray-500">
        {t("benchmark.loading") || "Ładowanie danych..."} {/* ✅ FAZA 12 */}
      </p>
    );

  return (
    <div className={`p-6 rounded shadow ${theme.bgCard} ${theme.textPrimary}`}> {/* ✅ FAZA 9 */}
      <h2 className="text-xl font-bold mb-4">
        📈 {t("benchmark.title") || "Benchmark Twojej firmy"} {/* ✅ FAZA 1 */}
      </h2>
      <p>
        <strong>{t("benchmark.ctr") || "CTR"}:</strong> {data.ctr}%
      </p>
      <p>
        <strong>{t("benchmark.position") || "Pozycja"}:</strong>{" "}
        <FirmPositionTag position={data.position} />
      </p>
      <p>
        <strong>{t("benchmark.responseTime") || "Średni czas odpowiedzi"}:</strong> {data.responseTime} min
      </p>
      <p>
        <strong>{t("benchmark.offerScore") || "Średnia jakość ofert"}:</strong> {data.offerScore}/10
      </p>
    </div>
  );
};

export default FirmBenchmarkDashboard;
