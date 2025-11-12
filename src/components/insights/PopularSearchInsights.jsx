// 📍 src/components/insights/PopularSearchInsights.jsx
import React from 'react';
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card.jsx";

export default function PopularSearchInsights() {
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    fetch("/api/analytics/search-log")
      .then((res) => res.json())
      .then(setPopular)
      .catch(() => setPopular([]));
  }, []);

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-2">
        <h3 className="text-sm font-semibold">Najczęściej szukane hasła (7 dni)</h3>
        <ul className="text-sm text-muted-foreground list-disc ml-4">
          {popular.map((q, i) => (
            <li key={i}>{q.term} ({q.count})</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}