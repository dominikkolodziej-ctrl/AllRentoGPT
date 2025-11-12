import React, { lazy, Suspense, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext.jsx";
import { useLiveText } from "@/context/LiveTextContext.jsx";
import ProtectedRoute from "../components/routing/ProtectedRoute";

// Public pages
const Home = lazy(() => import("../pages/Home.jsx"));
const Login = lazy(() => import("../pages/Login.jsx"));
const Register = lazy(() => import("../pages/Register.jsx"));
const Offers = lazy(() => import("../pages/Offers.jsx"));
const OfferDetails = lazy(() => import("../pages/offers/OfferDetails.jsx"));
const SubscriptionPlans = lazy(() => import("../pages/SubscriptionPlans.jsx"));
const MapView = lazy(() => import("../pages/MapView.jsx"));
const NotFound = lazy(() => import("../pages/NotFound.jsx"));

// Dashboards
const ProviderDashboard = lazy(() => import("../pages/ProviderDashboard.jsx"));
const ClientDashboard = lazy(() => import("../pages/ClientDashboard.jsx"));

// Provider routes
const ProviderOffers = lazy(() => import("../pages/dashboard/provider/ProviderOffers.jsx"));
const ProviderStats = lazy(() => import("../pages/dashboard/provider/ProviderStats.jsx"));
const ProviderInbox = lazy(() => import("../pages/dashboard/provider/ProviderInbox.jsx"));
const ProviderProfile = lazy(() => import("../pages/dashboard/provider/ProviderProfile.jsx"));
const PlanManager = lazy(() => import("../pages/dashboard/provider/PlanManager.jsx"));

// Client routes
const ClientReservations = lazy(() => import("../pages/dashboard/client/ClientReservations.jsx"));
const ClientInbox = lazy(() => import("../pages/dashboard/client/ClientInbox.jsx"));
const ClientFavorites = lazy(() => import("../pages/dashboard/client/ClientFavorites.jsx"));

// Contracts / Admin
const ContractViewer = lazy(() => import("../pages/contracts/ContractViewer.jsx"));
const ContractSender = lazy(() => import("../pages/contracts/ContractSender.jsx"));
const ContractManager = lazy(() => import("../pages/contracts/ContractManager.jsx"));
const ContractArchiveTable = lazy(() => import("../modules/contract/ContractArchiveTable.jsx"));
const AdminPanel = lazy(() => import("../pages/AdminPanel.jsx"));

const RouterConfig = () => {
  const theme = useTheme?.();
  const live = useLiveText();
  const t = useCallback((k, d) => (live && typeof live.t === "function" ? live.t(k, d) : d ?? k), [live]);

  const fallback = (
    <div
      className="p-4 text-center"
      style={{ color: theme?.colors?.text }}
      data-theme={theme?.theme || theme?.current || theme?.name || theme?.mode}
      aria-busy="true"
    >
      {t("common.loading", "Ładowanie...")}
    </div>
  );

  return (
    <Suspense fallback={fallback}>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public offer views */}
        <Route path="/offers" element={<Offers />} />
        <Route path="/offers/:id" element={<OfferDetails />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/plans" element={<SubscriptionPlans />} />

        {/* Provider */}
        <Route
          path="/dashboard/provider"
          element={<ProtectedRoute role="provider"><ProviderDashboard /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/provider/offers"
          element={<ProtectedRoute role="provider"><ProviderOffers /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/provider/stats"
          element={<ProtectedRoute role="provider"><ProviderStats /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/provider/inbox"
          element={<ProtectedRoute role="provider"><ProviderInbox /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/provider/profile"
          element={<ProtectedRoute role="provider"><ProviderProfile /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/provider/plan"
          element={<ProtectedRoute role="provider"><PlanManager /></ProtectedRoute>}
        />

        {/* Client */}
        <Route
          path="/dashboard/client"
          element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/client/reservations"
          element={<ProtectedRoute role="client"><ClientReservations /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/client/inbox"
          element={<ProtectedRoute role="client"><ClientInbox /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/client/favorites"
          element={<ProtectedRoute role="client"><ClientFavorites /></ProtectedRoute>}
        />

        {/* Contracts */}
        <Route
          path="/contracts/viewer"
          element={<ProtectedRoute role="client"><ContractViewer /></ProtectedRoute>}
        />
        <Route
          path="/contracts/sender"
          element={<ProtectedRoute role="provider"><ContractSender /></ProtectedRoute>}
        />
        <Route
          path="/contracts/manage"
          element={<ProtectedRoute role="provider"><ContractManager /></ProtectedRoute>}
        />
        <Route
          path="/contracts/archive"
          element={<ProtectedRoute role="admin"><ContractArchiveTable /></ProtectedRoute>}
        />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default RouterConfig;
