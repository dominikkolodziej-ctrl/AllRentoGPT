import React, { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import LanguageSwitcher from '@/components/common/LanguageSwitcher.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const Navbar = ({ onEvent, className = '' }) => {
  const { authUser, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLiveText();
  const { theme } = useTheme();

  const labels = useMemo(
    () => ({
      brand: t('navbar.brand') || 'B2B Rental',
      login: t('navbar.login') || 'Zaloguj się',
      register: t('navbar.register') || 'Rejestracja',
      clientPanel: t('navbar.clientPanel') || 'Panel klienta',
      providerPanel: t('navbar.providerPanel') || 'Panel firmy',
      logout: t('navbar.logout') || 'Wyloguj się',
      navLabel: t('navbar.navigation') || 'Główna nawigacja',
    }),
    [t]
  );

  const handleLogout = useCallback(() => {
    try {
      logout?.();
      onEvent?.('logout_clicked');
    } finally {
      navigate('/login');
    }
  }, [logout, navigate, onEvent]);

  const dashboardPath =
    authUser?.role === 'provider'
      ? '/dashboard/provider'
      : authUser?.role === 'client'
      ? '/dashboard/client'
      : '/dashboard';

  const navClass =
    theme?.navbar ??
    'bg-white shadow p-4 flex items-center justify-between';

  const linkClass = theme?.link ?? 'text-gray-700 hover:text-blue-600';
  const logoutClass = theme?.logoutLink ?? 'text-red-500 hover:text-red-700 ml-4';

  return (
    <nav className={`${navClass} ${className}`} aria-label={labels.navLabel}>
      <Link to="/" className={theme?.brand ?? 'text-xl font-bold text-blue-600'}>
        {labels.brand}
      </Link>

      <div className="space-x-4 flex items-center gap-4">
        <LanguageSwitcher />
        {!authUser ? (
          <>
            <Link to="/login" className={linkClass}>
              {labels.login}
            </Link>
            <Link to="/register" className={linkClass}>
              {labels.register}
            </Link>
          </>
        ) : (
          <>
            {(authUser.role === 'client' || authUser.role === 'provider') && (
              <Link to={dashboardPath} className={linkClass}>
                {authUser.role === 'provider' ? labels.providerPanel : labels.clientPanel}
              </Link>
            )}
            <button type="button" onClick={handleLogout} className={logoutClass}>
              {labels.logout}
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export default memo(Navbar);
