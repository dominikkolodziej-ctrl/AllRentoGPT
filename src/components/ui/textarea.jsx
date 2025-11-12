import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { useTheme } from '@/context/ThemeContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';

export const Textarea = forwardRef(
  (
    {
      placeholder,
      value,
      onChange,
      className = '',
      error = false,           // ✅ FAZA 12: komunikat błędu / aria-invalid
      helperText = '',         // ✅ FAZA 12: opis pomocniczy
      showCount = false,       // ✅ FAZA 12: licznik znaków (z maxLength)
      maxLength,
      id,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme() || {};
    const { t } = useLiveText?.() || { t: (k) => k };

    const describedById = helperText ? `${id || 'textarea'}-desc` : undefined;
    const translatedPlaceholder =
      (typeof placeholder === 'string' && t?.(placeholder)) || placeholder;

    return (
      <div className="w-full">
        <textarea
          id={id}
          ref={ref}
          placeholder={translatedPlaceholder}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={describedById}
          className={clsx(
            'border rounded p-2 w-full outline-none transition focus:ring-2',
            error ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary',
            theme?.input, // ✅ FAZA 9: style z motywu
            className
          )}
          {...props}
        />
        <div className="mt-1 flex items-start justify-between text-xs">
          {helperText ? (
            <span
              id={describedById}
              className={clsx(
                error ? 'text-red-600' : 'text-gray-500',
                theme?.helpText
              )}
            >
              {helperText}
            </span>
          ) : <span />}
          {showCount && typeof value === 'string' && maxLength ? (
            <span className="text-gray-400">
              {value.length}/{maxLength}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

Textarea.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  className: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  helperText: PropTypes.string,
  showCount: PropTypes.bool,
  maxLength: PropTypes.number,
  id: PropTypes.string,
};

export default Textarea;

// ✅ FAZA 1: tłumaczenie placeholdera (useLiveText → t())
// ✅ FAZA 9: motywowanie klas (theme.input / theme.helpText)
// ✅ FAZA 12: statusy komponentu (error, helperText, licznik znaków, aria-*)
