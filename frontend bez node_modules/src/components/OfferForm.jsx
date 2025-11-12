import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

function OfferForm({ formData, setFormData, className = '', onEvent }) {
  const { t } = useLiveText();
  const { theme } = useTheme();

  const handleCheckbox = useCallback(
    (e) => {
      const value = e.target.checked;
      setFormData((prev) => ({ ...prev, b2bOnly: value }));
      onEvent?.('offer_b2b_only_changed', { value });
    },
    [setFormData, onEvent]
  );

  const id = 'offer-b2b-only';

  return (
    <form className={`${theme?.form ?? ''} ${className}`}>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="checkbox"
          name="b2bOnly"
          checked={Boolean(formData?.b2bOnly)}
          onChange={handleCheckbox}
          className={theme?.checkbox ?? 'h-4 w-4'}
        />
        <label htmlFor={id} className={theme?.label ?? ''}>
          {t('offer.b2bOnly.label')}
        </label>
      </div>
    </form>
  );
}

OfferForm.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  className: PropTypes.string,
  onEvent: PropTypes.func,
};

export default memo(OfferForm);
