import { useEffect, useState } from 'react';

export type AnalyticsData = {
  ctr: number;
  views: number;
  submissions: number;
  avgDuration: number;
  benchmark: number;
};

function isAnalyticsData(v: unknown): v is AnalyticsData {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.ctr === 'number' &&
    typeof o.views === 'number' &&
    typeof o.submissions === 'number' &&
    typeof o.avgDuration === 'number' &&
    typeof o.benchmark === 'number'
  );
}

const useAnalytics = (firmaId: string): { data: AnalyticsData | null; loading: boolean } => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!firmaId) {
      setData(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(`/api/analytics?firmaId=${encodeURIComponent(firmaId)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: unknown = await res.json();
        setData(isAnalyticsData(json) ? json : null);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [firmaId]);

  return { data, loading };
};

export default useAnalytics;
