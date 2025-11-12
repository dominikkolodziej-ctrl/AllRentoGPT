// src/components/DrawerMenu.jsx – menu mobilne typu burger
import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from '@/context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import useIsMobile from '@/hooks/useIsMobile.js';

export default function DrawerMenu() {
  const [open, setOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  if (!isMobile) return null;

  const nav = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded bg-white border shadow"
        aria-label="Otwórz menu"
      >
        <Menu />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50">
          <div
            className="absolute top-0 left-0 h-full w-64 bg-white shadow-md p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg">Menu</h2>
              <button onClick={() => setOpen(false)} aria-label="Zamknij menu">
                <X />
              </button>
            </div>

            <nav className="flex flex-col gap-3">
              <button onClick={() => nav('/')}>🏠 Główna</button>
              <button onClick={() => nav('/map')}>🗺️ Mapa</button>
              <button onClick={() => nav('/offers')}>📦 Oferty</button>
              <button
                onClick={() =>
                  nav(user?.role === 'provider' ? '/dashboard/provider' : '/dashboard/client')
                }
              >
                👤 Panel
              </button>
              <button onClick={() => nav('/messages')}>💬 Wiadomości</button>
              <button onClick={() => nav('/settings')}>⚙️ Ustawienia</button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

DrawerMenu.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string,
  }),
};
