// Ścieżka: src/components/Analytics/ReportsDashboard.tsx
import React, { useEffect } from 'react';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js'; // ✅ FAZA 1: tłumaczenia UI
import BenchmarkChart from "@/components/analytics/BenchmarkChart";
import useAnalytics from "@/hooks/useAnalytics";

interface AnalyticsData {
  ctr: number;
  views: number;
  submissions: number;
  avgDuration: number;
  benchmark: number;
}

interface ReportsDashboardProps {
  firmaId: string;
}

const ReportsDashboard = ({ firmaId }: ReportsDashboardProps) => {
  const { t } = useLiveText(); // ✅ FAZA 1
  const { data, loading }: { data: AnalyticsData; loading: boolean } = useAnalytics(firmaId);

  useEffect(() => {
    if (data) console.log("Dane analityczne:", data);
  }, [data]);

  if (loading || !data) return <p>{t("loading_data")}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">📊 {t("report_performance")}</h2>
      <div>
        <p className="text-sm text-gray-600">{t("ctr")}: <strong>{data.ctr}%</strong></p>
        <p className="text-sm text-gray-600">{t("views")}: {data.views}</p>
        <p className="text-sm text-gray-600">{t("submissions")}: {data.submissions}</p>
        <p className="text-sm text-gray-600">{t("avg_duration")}: {data.avgDuration} {t("days")}</p>
      </div>
      <BenchmarkChart firmaScore={data.ctr} avgScore={data.benchmark} />
    </div>
  );
};

export default ReportsDashboard;
