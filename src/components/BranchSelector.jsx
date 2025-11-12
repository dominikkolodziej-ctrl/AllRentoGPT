import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';

// BranchSelector.jsx – wybór oddziału firmy (przypisanie ofert)
// Lokalizacja: src/components/BranchSelector.jsx

const BranchSelector = ({ branches = [], selectedBranchId, onChange }) => {
  const { theme } = useTheme() || {};
  const { t } = useLiveText?.() || { t: (k) => k };

  return (
    <div className="mb-4">
      <label
        htmlFor="branchSelector"
        className={theme?.form?.label || 'block text-sm font-medium text-gray-700 mb-1'}
      >
        {t('branchSelector.label') || 'Przypisz do oddziału:'}
      </label>

      <select
        id="branchSelector"
        value={selectedBranchId || ''}
        onChange={(e) => onChange?.(e.target.value)}
        className={
          theme?.form?.select ||
          'w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
        }
        aria-label={t('branchSelector.ariaLabel') || 'Wybierz oddział'}
      >
        <option value="">
          {t('branchSelector.none') || 'Brak przypisania'}
        </option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name} – {branch.city}
          </option>
        ))}
      </select>
    </div>
  );
};

BranchSelector.propTypes = {
  branches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      city: PropTypes.string.isRequired,
    })
  ),
  selectedBranchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
};

export default BranchSelector;

// ✅ FAZA 1: tłumaczenia label, opcje i aria-label
// ✅ FAZA 9: motyw (theme.form.label, theme.form.select)
// ✅ FAZA 12: dostępność (htmlFor, aria-label, focus ring)
