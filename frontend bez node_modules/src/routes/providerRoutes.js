// ✅ src/routes/providerRoutes.js
import React, { lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";

const MyOffers = lazy(() => import("../pages/dashboard/provider/MyOffers.jsx"));
const AddOffer = lazy(() => import("../pages/AddOffer.jsx"));
const EditProfile = lazy(() => import("../pages/EditProfile.jsx"));
const Messages = lazy(() => import("../pages/Messages.jsx"));
const Stats = lazy(() => import("../pages/Stats.jsx"));
const SubscriptionPlans = lazy(() => import("../pages/SubscriptionPlans.jsx"));
const CompanyProfile = lazy(() => import("../pages/CompanyProfile.jsx"));
const OfferDetails = lazy(() => import("../pages/offers/OfferDetails.jsx"));
const FilterOffers = lazy(() => import("../pages/FilterOffers.jsx"));

const Guard = ({ children }) => {
  const { authUser } = useAuth?.() || {};
  if (!authUser || (authUser.role !== "provider" && authUser.role !== "admin")) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

Guard.propTypes = {
  children: PropTypes.node.isRequired,
};

const withSuspense = (node) => (
  <Suspense fallback={<div className="p-4">Ładowanie...</div>}>{node}</Suspense>
);

const providerRoutes = [
  {
    path: "my-offers",
    element: <Guard>{withSuspense(<MyOffers />)}</Guard>,
  },
  {
    path: "add-offer",
    element: <Guard>{withSuspense(<AddOffer />)}</Guard>,
  },
  {
    path: "edit-profile",
    element: <Guard>{withSuspense(<EditProfile />)}</Guard>,
  },
  {
    path: "messages",
    element: <Guard>{withSuspense(<Messages />)}</Guard>,
  },
  {
    path: "stats",
    element: <Guard>{withSuspense(<Stats />)}</Guard>,
  },
  {
    path: "subscriptions",
    element: <Guard>{withSuspense(<SubscriptionPlans />)}</Guard>,
  },
  {
    path: "company-profile",
    element: <Guard>{withSuspense(<CompanyProfile />)}</Guard>,
  },
  {
    path: "offer-details/:id",
    element: <Guard>{withSuspense(<OfferDetails />)}</Guard>,
  },
  {
    path: "filter-offers",
    element: <Guard>{withSuspense(<FilterOffers />)}</Guard>,
  },
];

export default providerRoutes;
