import PropTypes from 'prop-types';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';

// ✅ FAZA 5: Ochrona z rolami i tokenem
export default function ProtectedRoute({ children, roles }) {
  const { authUser } = useAuth();
  const location = useLocation();

  // Sprawdzenie zalogowania i tokena
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('authToken');

  if (!authUser || !hasToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Sprawdzenie ról, jeśli wymagane
  if (roles?.length && !roles.includes(authUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.any,
  roles: PropTypes.arrayOf(PropTypes.string), // np. ['admin', 'manager']
};
