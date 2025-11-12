import React from 'react';
import { useNavigate } from "react-router-dom";

export default function NeedHelpStarter() {
  const navigate = useNavigate();

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded shadow-sm text-center space-y-2">
      <h3 className="text-lg font-semibold">Nie wiesz jak zacząć?</h3>
      <p className="text-sm text-gray-700">
        Wypełnij krótką ankietę – pokażemy Ci oferty dopasowane do Twojej firmy.
      </p>
      <button
        onClick={() => navigate("/start")}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
      >
        Pomóż mi zacząć
      </button>
    </div>
  );
}