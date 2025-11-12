import PropTypes from 'prop-types';
import React, { useEffect, useState } from "react";

export default function RecommendedAssetsPanel({ userId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/recommendation?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.recommendations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  return (
    <div className="p-4 bg-white border rounded shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Rekomendowane dla Twojej firmy</h3>
      {loading ? (
        <p className="text-sm text-gray-500">Ładowanie rekomendacji...</p>
      ) : items.length ? (
        <ul className="list-disc ml-5 text-sm text-gray-800">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">Brak danych – uzupełnij profil firmy.</p>
      )}
    </div>
  );
}

RecommendedAssetsPanel.propTypes = {
  userId: PropTypes.string.isRequired,
};
