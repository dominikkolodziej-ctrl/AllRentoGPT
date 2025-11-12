// src/components/availability/AvailabilityCalendar.jsx

import React from 'react';
import PropTypes from 'prop-types';

const AvailabilityCalendar = ({ availableDates = [] }) => {
  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-2">Kalendarz dostępności</h2>
      <ul className="grid grid-cols-3 gap-2">
        {availableDates.map((date) => (
          <li key={date} className="bg-green-100 text-center rounded p-2">{date}</li>
        ))}
      </ul>
    </div>
  );
};

AvailabilityCalendar.propTypes = {
  availableDates: PropTypes.arrayOf(PropTypes.string),
};

export default AvailabilityCalendar;
