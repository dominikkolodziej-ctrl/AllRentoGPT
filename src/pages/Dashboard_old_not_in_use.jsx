
import React from 'react';

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const tiles = [
  {
    title: "Moje Oferty",
    description: "Zarządzaj swoimi ogłoszeniami i dodawaj nowe.",
    href: "/my-offers",
    icon: "📦",
  },
  {
    title: "Wiadomości",
    description: "Odpowiadaj na zapytania klientów.",
    href: "/messages",
    icon: "✉️",
  },
  {
    title: "Statystyki",
    description: "Śledź liczbę zapytań i wyświetleń ofert.",
    href: "/stats",
    icon: "📊",
  },
  {
    title: "Edycja profilu",
    description: "Zmień dane kontaktowe i opis firmy.",
    href: "/edit-profile",
    icon: "⚙️",
  },
  {
    title: "Cennik i subskrypcje",
    description: "Zmień swój plan i promuj ogłoszenia.",
    href: "/plans",
    icon: "💰",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { isProvider } = useAuth();

  if (!isProvider) {
    return (
      <div className="p-8 text-center text-red-600">
        Tylko firmy mają dostęp do tego panelu.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-700 text-center mb-12">
          Panel Firmy
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {tiles.map((tile, index) => (
            <button
              key={index}
              onClick={() => navigate(tile.href)}
              className="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition-all border hover:border-blue-500"
            >
              <div className="text-4xl mb-2">{tile.icon}</div>
              <div className="text-lg font-semibold text-blue-800">{tile.title}</div>
              <p className="text-sm text-gray-600 mt-1">{tile.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
