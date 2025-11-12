// src/utils/geoUtils.js

export const Regions = Object.freeze({
  NORTH: "North",
  SOUTH: "South",
  UNKNOWN: "Unknown",
});

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export const isValidLatLon = (lat, lon) => {
  const la = toNum(lat);
  const lo = toNum(lon);
  return la !== null && lo !== null && la >= -90 && la <= 90 && lo >= -180 && lo <= 180;
};

export const getRegionFromCoordinates = (lat, lon) => {
  if (!isValidLatLon(lat, lon)) return Regions.UNKNOWN;
  const la = Number(lat);
  if (la > 50) return Regions.NORTH;
  if (la < 50) return Regions.SOUTH;
  return Regions.UNKNOWN;
};

export default { getRegionFromCoordinates, isValidLatLon, Regions };
