import React from 'react';
import PropTypes from 'prop-types';
// 📍 src/components/analytics/CTRChart.jsx (v1 ENTERPRISE)
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

/**
 * @param {Array} data - tablica obiektów typu { name: string, views: number, clicks: number }
 */
export default function CTRChart({ data }) {
  return (
    <div className="w-full h-[300px] bg-white border rounded-xl shadow-sm p-4">
      <h3 className="text-sm font-semibold mb-2">CTR (Click Through Rate)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="views" fill="#8884d8" name="Wyświetlenia" />
          <Bar dataKey="clicks" fill="#82ca9d" name="Kliknięcia" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

CTRChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      views: PropTypes.number.isRequired,
      clicks: PropTypes.number.isRequired,
    })
  ).isRequired,
};
