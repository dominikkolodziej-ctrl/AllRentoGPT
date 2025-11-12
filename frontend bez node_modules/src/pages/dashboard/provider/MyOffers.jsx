import React, { useState } from "react";
import OfferForm from "../components/OfferForm";
import demoOffers from "../data/demoOffers";

const MyOffers = () => {
  const [offers, setOffers] = useState(demoOffers);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAdd = (newOffer) => {
    setOffers([...offers, newOffer]);
    setEditingIndex(null);
  };

  const handleUpdate = (updatedOffer) => {
    const updatedOffers = offers.map((offer, index) =>
      index === editingIndex ? updatedOffer : offer
    );
    setOffers(updatedOffers);
    setEditingIndex(null);
  };

  const handleRemove = (index) => {
    const filtered = offers.filter((_, i) => i !== index);
    setOffers(filtered);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Moje oferty</h1>
      {offers.map((offer, index) => (
        <div key={index} className="border rounded-lg mb-4 p-4 bg-white shadow">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="font-semibold">{offer.title}</p>
              <p className="text-sm text-gray-600">{offer.location}</p>
            </div>
            <button
              onClick={() => setEditingIndex(index)}
              className="text-blue-500 hover:underline text-sm"
              type="button"
              aria-label={`Edytuj ofertę ${offer.title || ''}`}
            >
              Edytuj
            </button>
          </div>
        </div>
      ))}
      {editingIndex !== null && (
        <OfferForm
          offer={offers[editingIndex]}
          onSave={editingIndex !== null ? handleUpdate : handleAdd}
          onChange={() => {}}
          onRemove={() => handleRemove(editingIndex)}
        />
      )}
    </div>
  );
};

export default MyOffers;
