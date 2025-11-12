import React from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '@/context/AuthContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const PlanAccessControl = ({
  requiredPlans = [],
  requiredRoles = [],
  children,
  fallback = null,
  className = '',
  onEvent,
}) => {
  const { user } = useAuth();
  const { t } = useLiveText();
  const { theme } = useTheme();

  const plansArr = Array.isArray(requiredPlans)
    ? requiredPlans.filter(Boolean)
    : [requiredPlans].filter(Boolean);
  const rolesArr = Array.isArray(requiredRoles)
    ? requiredRoles.filter(Boolean)
    : [requiredRoles].filter(Boolean);

  const userPlan = user?.company?.plan || 'trial';
  const userRole = user?.role || '';

  const planAllowed = plansArr.length === 0 || plansArr.includes(userPlan);
  const roleAllowed = rolesArr.length === 0 || rolesArr.includes(userRole);
  const isAllowed = planAllowed && roleAllowed;

  if (!isAllowed) {
    onEvent?.('access_blocked', {
      userPlan,
      userRole,
      requiredPlans: plansArr,
      requiredRoles: rolesArr,
    });

    const warnClass =
      theme?.alertWarning ??
      'text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded p-3';

    const plansLabel =
      plansArr.length > 0 ? plansArr.join(' / ') : t('planAccess.any') || 'dowolny';
    const rolesLabel =
      rolesArr.length > 0 ? rolesArr.join(' / ') : t('planAccess.any') || 'dowolna';

    return (
      fallback || (
        <div
          className={`${warnClass} ${className}`}
          role="note"
          aria-live="polite"
        >
          {t('planAccess.onlyIn') || 'Ta funkcja dostępna tylko w planie'}:{' '}
          <strong>{plansLabel}</strong>.
          {' '}
          {t('planAccess.currentPlan') || 'Twój obecny plan'}:{' '}
          <strong>{userPlan}</strong>.
          {rolesArr.length > 0 && (
            <>
              {' '}
              {t('planAccess.requiredRoles') || 'Wymagane role'}:{' '}
              <strong>{rolesLabel}</strong>.{' '}
              {t('planAccess.yourRole') || 'Twoja rola'}:{' '}
              <strong>{userRole || t('planAccess.none') || 'brak'}</strong>.
            </>
          )}
        </div>
      )
    );
  }

  return <>{children}</>;
};

PlanAccessControl.propTypes = {
  requiredPlans: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  requiredRoles: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  children: PropTypes.node,
  fallback: PropTypes.node,
  className: PropTypes.string,
  onEvent: PropTypes.func,
};

export default PlanAccessControl;
