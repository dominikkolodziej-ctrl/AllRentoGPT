import PropTypes from "prop-types";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";

const RequireAuth = ({ children, roles = [] }) => {
  const { authUser } = useAuth();
  const location = useLocation();

  if (!authUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (Array.isArray(roles) && roles.length > 0) {
    const userRole = String(authUser.role || "").toLowerCase();
    const allowed = roles.map((r) => String(r).toLowerCase());
    if (!allowed.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

RequireAuth.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
};

export default RequireAuth;
