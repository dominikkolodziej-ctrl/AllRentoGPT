import clsx from 'clsx';
import React from 'react';
import { useTheme } from '@/context/ThemeContext.jsx';
import PropTypes from 'prop-types';

const PlanGate = ({ required = "pro", children }) => {
  const { theme } = useTheme();

  const stored = localStorage.getItem("mock-user");
  const user = stored ? JSON.parse(stored) : null;
  const userPlan = user?.plan || "basic";

  const plans = ["basic", "pro", "enterprise"];
  const hasAccess = plans.indexOf(userPlan) >= plans.indexOf(required);

  if (!hasAccess) {
    return (
      <div className={clsx("p-4 border border-yellow-400 rounded text-sm", theme.background, theme.text)}>
        <p className="text-yellow-700 font-semibold">Dostęp ograniczony</p>
        <p className="text-yellow-600">
          Ta funkcja jest dostępna od planu <strong>{required}</strong>.
        </p>
      </div>
    );
  }

  return <React.Fragment>{children}</React.Fragment>;
};

PlanGate.propTypes = {
  required: PropTypes.string,
  children: PropTypes.any,
};

export default PlanGate;
