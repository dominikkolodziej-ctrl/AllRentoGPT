import React, { Suspense } from 'react';
const TextCMSPanel = React.lazy(() => import('@/components/LiveTextCMS/TextCMSPanel.jsx'));

export default function AdminTextsPage() {
  return (
    <Suspense fallback={<div role="status" aria-busy="true" className="p-6">Ładowanie…</div>}>
      <TextCMSPanel />
    </Suspense>
  );
}
