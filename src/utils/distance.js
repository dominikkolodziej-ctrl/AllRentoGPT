// src/utils/distance.js

/**
 * Zamienia stopnie na radiany.
 * @param {number} deg
 * @returns {number}
 */
const toRadians = (deg) => (Number(deg) * Math.PI) / 180;

/**
 * Oblicza odległość w linii prostej między dwoma punktami (Haversine) w kilometrach.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Odległość w km (NaN, jeśli dane wejściowe są niepoprawne).
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const φ1 = Number(lat1);
  const λ1 = Number(lon1);
  const φ2 = Number(lat2);
  const λ2 = Number(lon2);

  if ([φ1, λ1, φ2, λ2].some((v) => Number.isNaN(v))) return NaN;

  const R = 6371.0088; // promień Ziemi w km (średni)
  const dφ = toRadians(φ2 - φ1);
  const dλ = toRadians(λ2 - λ1);

  const a =
    Math.sin(dφ / 2) ** 2 +
    Math.cos(toRadians(φ1)) * Math.cos(toRadians(φ2)) * Math.sin(dλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default calculateDistance;
