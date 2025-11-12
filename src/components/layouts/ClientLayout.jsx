import PropTypes from 'prop-types';
import React from 'react';
import FeedbackPrompt from "@/components/common/FeedbackPrompt.jsx";

import Navbar from "@/components/Navbar.jsx";

const ClientLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4">{children}</main>
          <FeedbackPrompt />
    </div>
  );
};

export default ClientLayout;

ClientLayout.propTypes = {
  children: PropTypes.any,
};