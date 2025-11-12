// frontend/src/context/ThemeContext.jsx (jeśli patchujesz oryginał)
import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isStaging] = useState(import.meta.env.VITE_APP_ENV === 'staging');

  return (
    <ThemeContext.Provider value={{ isStaging }}>
      {isStaging && (
        <div style={{ background: '#6b21a8', color: 'white', textAlign: 'center' }}>
          STAGING MODE
        </div>
      )}
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node,
};
