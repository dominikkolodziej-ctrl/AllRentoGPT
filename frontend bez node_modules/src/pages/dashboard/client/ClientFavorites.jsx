// src/pages/dashboard/client/ClientFavorites.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@/context/ThemeContext.jsx';

const ClientFavorites = ({ favorites = [] }) => {
  const theme = useTheme();

  return (
    <section
      className={`${theme.background} ${theme.text} p-4 rounded-xl shadow`}
      aria-labelledby="client-favorites-heading"
    >
      <h2 id="client-favorites-heading" className="text-lg font-bold mb-4">
        🌟 Ulubione oferty
      </h2>
      {favorites.length === 0 ? (
        <p className="text-gray-500">Nie masz jeszcze ulubionych ofert.</p>
      ) : (
        <ul className="space-y-2">
          {favorites.map((f) => (
            <li key={f._id} className="border p-3 rounded">
              <div className="font-semibold">{f.title}</div>
              <div className="text-sm text-gray-600">{f.location}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

ClientFavorites.propTypes = {
  favorites: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      title: PropTypes.string,
      location: PropTypes.string,
    })
  ),
};

export default ClientFavorites;
