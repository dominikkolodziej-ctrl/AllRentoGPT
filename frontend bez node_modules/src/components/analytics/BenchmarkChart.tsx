// Ścieżka: src/components/Analytics/BenchmarkChart.tsx
import React from 'react';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1: tłumaczenia UI

type BenchmarkChartProps = {
  firmaScore: number;
  avgScore: number;
};

const BenchmarkChart = ({ firmaScore, avgScore }: BenchmarkChartProps) => {
  const { t } = useLiveText();
  const diff = firmaScore - avgScore;

  return (
    <div className="border rounded p-4 bg-white shadow-sm">
      <h3 className="text-sm font-medium mb-2">📉 {t("analytics.benchmark.title")}</h3>
      <p className="text-sm">
        {t("analytics.benchmark.firma")}: <strong>{firmaScore}%</strong>
      </p>
      <p className="text-sm">
        {t("analytics.benchmark.avg")}: <strong>{avgScore}%</strong>
      </p>
      <p className="text-sm mt-2">
        {diff >= 0
          ? t("analytics.benchmark.better", { diff: diff.toFixed(1) })
          : t("analytics.benchmark.worse", { diff: Math.abs(diff).toFixed(1) })}
      </p>
    </div>
  );
};

export default BenchmarkChart;
