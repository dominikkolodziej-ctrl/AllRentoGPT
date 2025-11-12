import React from 'react';
import { useSystemStatus } from '@/hooks/useSystemStatus.js';
import StatusIndicator from "@/components/common/StatusIndicator.jsx";

const SystemStatusWidget = () => {
  const status = useSystemStatus();

  const label = {
    ok: 'Działa poprawnie',
    degraded: 'Spowolnienia',
    down: 'Awaria',
    loading: 'Sprawdzanie...'
  }[status];

  return (
    <div className="flex items-center gap-2 text-sm">
      <StatusIndicator status={status} />
      <span>{label}</span>
    </div>
  );
};

export default SystemStatusWidget;
