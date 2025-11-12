// Ścieżka: src/components/Signature/SignatureMethodSelector.tsx
import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';

const SignatureMethodSelector = ({ selected, onSelect }) => {
  const { theme } = useTheme();
  const { t } = useLiveText();

  const methods = [
    { value: "bank", labelKey: "signature.method.bank", fallback: "🏦 Bankowość elektroniczna" },
    { value: "szafir", labelKey: "signature.method.szafir", fallback: "🔷 Podpis kwalifikowany (Szafir)" },
    { value: "manual", labelKey: "signature.method.manual", fallback: "✍️ Manualny (druk + skan)" },
    { value: "external_autenti", labelKey: "signature.method.external_autenti", fallback: "🌐 Autenti / inny" }
  ];

  // helper do fallbacku
  const safeT = (key: string, fallback: string) => {
    const res = t(key);
    return res || fallback;
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">
        {safeT("signature.selectMethod", "Wybierz metodę podpisu:")}
      </h3>
      {methods.map((m) => (
        <label
          key={m.value}
          className={`flex items-center gap-2 text-sm ${theme.textPrimary || ""}`}
        >
          <input
            type="radio"
            name="signatureMethod"
            value={m.value}
            checked={selected === m.value}
            onChange={() => onSelect(m.value)}
            className="form-radio accent-indigo-600"
          />
          {safeT(m.labelKey, m.fallback)}
        </label>
      ))}
    </div>
  );
};

SignatureMethodSelector.propTypes = {
  selected: PropTypes.string,
  onSelect: PropTypes.func
};

export default SignatureMethodSelector;
