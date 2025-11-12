import PropTypes from 'prop-types';
import React from 'react';
// 📍 src/components/analytics/CompanyBenchmarkPanel.jsx (v1 ENTERPRISE)
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Progress } from "@/components/ui/progress";

export default function CompanyBenchmarkPanel({ metrics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {metrics.map((item) => {
        const ratio = Math.min((item.value / item.industryAverage) * 100, 200);
        return (
          <Card key={item.label} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                <span className="text-sm font-semibold">
                  {item.value} / {item.industryAverage}
                </span>
              </div>
              <Progress value={ratio} className="h-2" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Przykład danych wejściowych:
 * metrics = [
 *   { label: "CTR", value: 4.2, industryAverage: 3.8 },
 *   { label: "Czas reakcji (h)", value: 1.8, industryAverage: 2.4 }
 * ]
 */

CompanyBenchmarkPanel.propTypes = {
  metrics: PropTypes.any,
};