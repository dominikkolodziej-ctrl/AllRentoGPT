import React from 'react';
import TextCMSPanel from '@/components/LiveTextCMS/TextCMSPanel.jsx';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/context/LiveTextContext.jsx';

export default function AdminTextsPage() {
  const { theme } = useTheme(); // ✅ FAZA 12 WDROŻONA
  const { t } = useLiveText(); // ✅ FAZA 1 WDROŻONA

  return (
    <div
      className="p-6"
      style={{
        backgroundColor: theme?.surface || theme?.background || undefined,
        color: theme?.text || undefined,
      }}
    >
      <h1 className="text-2xl font-bold mb-4">
        {t('admin.texts.title') || 'Teksty i tłumaczenia'}
      </h1>
      <TextCMSPanel />
    </div>
  );
}
