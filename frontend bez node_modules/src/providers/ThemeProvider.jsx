import React from "react";
import PropTypes from "prop-types";
import { ThemeProvider } from "@/context/ThemeContext.jsx";

const AppThemeProvider = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;

AppThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppThemeProvider;
