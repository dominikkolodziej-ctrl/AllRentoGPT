import React from 'react';

import AppRoutes from "./AppRoutes.jsx";
import WalkthroughModal from "./components/onboarding/WalkthroughModal.jsx";
import LiveTextDebugger from "./components/LiveTextCMS/LiveTextDebugger.jsx";
import LangSelector from "./components/LiveTextCMS/LangSelector.jsx";

import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { LiveTextProvider } from "./context/LiveTextContext.jsx";

function AppContent() {
  const { user } = useAuth();
  return (
    <>
      {user?.id && <WalkthroughModal userId={user.id} />}
      <LangSelector />
      <AppRoutes />
      <LiveTextDebugger />
    </>
  );
}

function App() {
  return (
    <LiveTextProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </LiveTextProvider>
  );
}

export default App;
