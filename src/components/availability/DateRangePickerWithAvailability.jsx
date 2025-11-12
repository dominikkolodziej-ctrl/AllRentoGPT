import PropTypes from 'prop-types';
import React, { useState } from 'react';

const DateRangePickerWithAvailability = ({ availableDates = [] }) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const isAvailable = (date) => availableDates.includes(date);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAvailable(from) || !isAvailable(to)) {
      alert("Wybrano niedostępny termin!");
    } else {
      alert(`Zarezerwowano od ${from} do ${to}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded space-y-2">
      <label htmlFor="fromDate">Data od:</label>
      <input
        id="fromDate"
        type="date"
        value={from}
        onChange={e => setFrom(e.target.value)}
        className="border p-2 w-full"
      />

      <label htmlFor="toDate">Data do:</label>
      <input
        id="toDate"
        type="date"
        value={to}
        onChange={e => setTo(e.target.value)}
        className="border p-2 w-full"
      />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Rezerwuj
      </button>
    </form>
  );
};

DateRangePickerWithAvailability.propTypes = {
  availableDates: PropTypes.arrayOf(PropTypes.string)
};

export default DateRangePickerWithAvailability;
