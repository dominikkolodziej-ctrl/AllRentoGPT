// src/AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home.jsx";               // ← Twój QuickFiltersHome (default export)
import AdminRouter from "./pages/admin/AdminRouter.jsx";
import OfferRouter from "./pages/offers/OfferRouter.jsx";
import OfferCreator from "./pages/admin/OfferCreator.jsx";
import InvoiceList from "./pages/admin/InvoiceList.jsx";
import InvoiceViewer from "./pages/admin/InvoiceViewer.jsx";
import AuditLogPanel from "./pages/admin/AuditLogPanel.jsx";
import ModerationInbox from "./pages/admin/ModerationInbox.jsx";
import SecurityOverview from "./pages/admin/SecurityOverview.jsx";
import CMSBlocksDemo from "./pages/admin/CMSBlocksDemo.jsx";
import OnboardingWizard from "./pages/admin/OnboardingWizard.jsx";
import BrandingPanel from "./pages/admin/BrandingPanel.jsx";
import ClientDashboardWrapper from "./pages/dashboard/client/ClientDashboardWrapper.jsx";
import AdminBillingPanel from "./pages/admin/AdminBillingPanel.jsx";
import OrganizationPanel from "./pages/admin/OrganizationPanel.jsx";
import ContractArchive from "./pages/dashboard/client/ContractArchive.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />        {/* ← zamiast Navigate to="/offers" */}
      <Route path="/admin/*" element={<AdminRouter />} />
      <Route path="/offers/*" element={<OfferRouter />} />
      <Route path="/admin/create-offer" element={<OfferCreator />} />
      <Route path="/admin/invoice-list" element={<InvoiceList />} />
      <Route path="/admin/invoice/:id" element={<InvoiceViewer />} />
      <Route path="/admin/audit" element={<AuditLogPanel />} />
      <Route path="/admin/moderation" element={<ModerationInbox />} />
      <Route path="/admin/security" element={<SecurityOverview />} />
      <Route path="/admin/cms-demo" element={<CMSBlocksDemo />} />
      <Route path="/admin/onboarding" element={<OnboardingWizard />} />
      <Route path="/admin/branding" element={<BrandingPanel />} />
      <Route path="/admin/billing" element={<AdminBillingPanel />} />
      <Route path="/dashboard/client" element={<ClientDashboardWrapper />} />
      <Route path="/admin/organization" element={<OrganizationPanel />} />
      <Route path="/client/documents" element={<ContractArchive />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
