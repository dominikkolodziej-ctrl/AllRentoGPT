import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lng", lng);
  };

  return (
    <div className="flex gap-2 text-sm">
      <button onClick={() => changeLanguage('pl')} className="hover:underline">🇵🇱 PL</button>
      <button onClick={() => changeLanguage('en')} className="hover:underline">🇬🇧 EN</button>
    </div>
  );
};

export default LanguageSwitcher;
