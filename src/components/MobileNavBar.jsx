import React, { memo, useContext, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Home, User, Layers3 } from 'lucide-react';
import MobileNotificationButton from '@/components/common/MobileNotificationButton.jsx';
import { AuthContext } from '@/context/AuthContext.jsx';
import useIsMobile from '@/hooks/useIsMobile.js';
import { useLiveText } from '@/components/LiveTextCMS/useLiveText.js';
import { useTheme } from '@/context/ThemeContext.jsx';

const MobileNavBar = ({ onEvent, className = '' }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { t } = useLiveText();
  const theme = useTheme();
  const classes = theme?.classes ?? {};

  const navClass =
    classes.mobileNav ??
    'fixed bottom-0 w-full bg-white border-t z-50 flex justify-around py-2';

  const activeClass = classes.activeNavIcon ?? 'text-blue-600';
  const inactiveClass = classes.inactiveNavIcon ?? 'text-gray-400';

  const isActive = useCallback(
    (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)),
    [location.pathname]
  );

  const items = useMemo(() => {
    const dashboardPath = user?.role === 'provider' ? '/dashboard/provider' : '/dashboard/client';
    return [
      { key: 'map', path: '/map', label: t('Mapa'), Icon: MapPin },
      { key: 'home', path: '/', label: t('Główna'), Icon: Home },
      { key: 'account', path: '/dashboard', to: dashboardPath, label: t('Konto'), Icon: User },
      { key: 'offers', path: '/offers', label: t('Oferty'), Icon: Layers3 },
    ];
  }, [t, user?.role]);

  const go = useCallback(
    (to) => {
      navigate(to);
      onEvent?.('mobile_nav_click', { to });
    },
    [navigate, onEvent]
  );

  if (!isMobile) return null;

  return (
    <nav
      className={`${navClass} ${className}`}
      role="navigation"
      aria-label={t('Dolna nawigacja mobilna')}
    >
      {items.map(({ key, path, to, label, Icon }) => {
        const dest = to || path;
        const active = isActive(path);
        return (
          <button
            key={key}
            type="button"
            onClick={() => go(dest)}
            className="flex flex-col items-center text-xs"
            aria-current={active ? 'page' : undefined}
            aria-label={label}
          >
            <Icon size={20} className={active ? activeClass : inactiveClass} />
            {label}
          </button>
        );
      })}

      <div className="flex flex-col items-center text-xs">
        <MobileNotificationButton />
        <span>{t('Powiadomienia')}</span>
      </div>
    </nav>
  );
};

MobileNavBar.propTypes = {
  onEvent: PropTypes.func,
  className: PropTypes.string,
};

export default memo(MobileNavBar);
