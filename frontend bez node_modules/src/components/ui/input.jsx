import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { ThemeContext } from '@/context/ThemeContext.jsx';
import { LiveTextContext } from '@/context/LiveTextContext.jsx';

/**
 * Enterprise-level Input component with full theming and live text support.
 */
const Input = ({ labelKey, className = "", ...rest }) => {
  const { theme } = useContext(ThemeContext) || {};
  const { getText } = useContext(LiveTextContext) || {};
  const label =
    (getText && labelKey ? getText(labelKey) : undefined) ||
    rest.placeholder ||
    rest.name ||
    "Input";

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className={clsx("text-sm font-medium text-gray-700", theme?.label)}>{label}</label>
      <input
        {...rest}
        className={clsx(
          "border rounded-xl px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary",
          theme?.input,
          className
        )}
      />
    </div>
  );
};

Input.propTypes = {
  labelKey: PropTypes.string,
  className: PropTypes.string,
};

export { Input };
export default Input;
