// Ścieżka: src/components/Signature/SignatureStatusTag.tsx
import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';

interface SignatureStatusTagProps {
  status?: string;
}

const SignatureStatusTag: React.FC<SignatureStatusTagProps> = ({ status }) => {
  const { theme } = useTheme();
  const { t } = useLiveText();

  const safeT = (key: string, fallback: string) => {
    const res = t(key);
    return res || fallback;
  };

  const labelMap: Record<string, string> = {
    signed_by_bank: safeT("signature.status.signed_by_bank", "🏦 Podpisano przez bank"),
    signed_by_szafir: safeT("signature.status.signed_by_szafir", "🔷 Szafir"),
    signed_manual_upload: safeT("signature.status.signed_manual_upload", "✍️ Podpis manualny"),
    signed_external_autenti: safeT("signature.status.signed_external_autenti", "🌐 Autenti"),
    default: safeT("signature.status.default", "📄 Brak podpisu")
  };

  const label = labelMap[status || ""] || labelMap.default;

  return (
    <span
      className={`text-xs px-2 py-1 rounded border ${theme?.tagBorder || "border-gray-300"} ${theme?.tagBg || "bg-gray-100"} ${theme?.tagText || "text-gray-700"}`}
    >
      {label}
    </span>
  );
};

SignatureStatusTag.propTypes = {
  status: PropTypes.string
};

export default SignatureStatusTag;
