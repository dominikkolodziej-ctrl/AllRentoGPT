import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';

const RequireAuth = ({
  children,
  role,
  roles,
  redirectTo = '/auth/login',
  unauthorizedTo = '/',
  onEvent,
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const requiredRoles = useMemo(() => {
    if (Array.isArray(roles) && roles.length) return roles.map(String);
    return role ? [String(role)] : [];
  }, [role, roles]);

  const userRoles = useMemo(() => {
    const list = Array.isArray(user?.roles) ? user.roles : [user?.role];
    return list.filter(Boolean).map(String);
  }, [user?.roles, user?.role]);

  const from = `${location.pathname}${location.search || ''}`;

  if (!user) {
    onEvent?.('auth_guard_redirect_anon', { to: redirectTo, from });
    return <Navigate to={redirectTo} replace state={{ next: from }} />;
  }

  const allowed =
    requiredRoles.length === 0 || requiredRoles.some((r) => userRoles.includes(r));

  if (!allowed) {
    onEvent?.('auth_guard_redirect_unauthorized', {
      to: unauthorizedTo,
      from,
      requiredRoles,
      userRoles,
    });
    return (
      <Navigate
        to={unauthorizedTo}
        replace
        state={{ reason: 'role', requiredRoles, userRoles, from }}
      />
    );
  }

  return <>{children}</>;
};

RequireAuth.propTypes = {
  children: PropTypes.node.isRequired,
  role: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  roles: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  redirectTo: PropTypes.string,
  unauthorizedTo: PropTypes.string,
  onEvent: PropTypes.func,
};

export default memo(RequireAuth);
