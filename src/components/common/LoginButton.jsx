// src/components/common/LoginButton.jsx
import React from 'react';
import { useTranslation } from "react-i18next";

const LoginButton = () => {
  const { t } = useTranslation();
  return <button>{t("login.button")}</button>;
};

export default LoginButton;
