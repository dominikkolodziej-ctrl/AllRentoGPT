import PropTypes from 'prop-types';
import React from 'react';
import FeedbackPrompt from "@/components/common/FeedbackPrompt.jsx";

import Navbar from "@/components/Navbar.jsx";

const ProviderLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto p-6">{children}</main>
          <FeedbackPrompt />
    </div>
  );
};

export default ProviderLayout;

ProviderLayout.propTypes = {
  children: PropTypes.any,
};