// 📍 src/components/availability/NearestAvailableOffer.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card.jsx";

export default function NearestAvailableOffer({ category }) {
  const [offer, setOffer] = useState(null);

  useEffect(() => {
    fetch(`/api/availability/nearest?category=${category}`)
      .then((res) => res.json())
      .then(setOffer)
      .catch(() => setOffer(null));
  }, [category]);

  if (!offer) return null;

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-2">Najbliższy dostępny termin</h3>
        {offer.available_from && (
          <p className="text-sm text-muted-foreground">
            {offer.name} — dostępna od {new Date(offer.available_from).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

NearestAvailableOffer.propTypes = {
  category: PropTypes.string.isRequired,
};
