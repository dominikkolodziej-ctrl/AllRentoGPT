import React from 'react';
import PropTypes from 'prop-types';

// src/components/ui/table.jsx
const Table = ({ headers, rows, className = '' }) => {
  return (
    <table className={`min-w-full table-auto ${className}`}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="border px-4 py-2 text-left">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className="border px-4 py-2">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

Table.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.node).isRequired,
  rows: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.node)).isRequired,
  className: PropTypes.string,
};

export default Table;

// ✅ FAZA 12 – mikro-status (bezpieczne renderowanie tabeli)
