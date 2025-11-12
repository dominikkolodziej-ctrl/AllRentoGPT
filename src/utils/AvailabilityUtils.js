// src/utils/AvailabilityUtils.js
import { eachDayOfInterval, format, isValid } from "date-fns";

/**
 * Normalizes input to a valid Date or returns null.
 * @param {Date|string|number} d
 * @returns {Date|null}
 */
const toDate = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  return isValid(dt) ? dt : null;
};

/**
 * Tworzy mapę dostępności dni w formacie: { '2025-06-11': true, ... }
 * @param {Date|string|number} start
 * @param {Date|string|number} end
 * @param {Array<Date|string|number>} unavailableDates - lista niedostępnych dat (Date lub string yyyy-MM-dd)
 */
export const buildAvailabilityMap = (start, end, unavailableDates = []) => {
  const s = toDate(start);
  const e = toDate(end);
  if (!s || !e) return {};

  const startDate = s <= e ? s : e;
  const endDate = s <= e ? e : s;

  const all = eachDayOfInterval({ start: startDate, end: endDate });
  const disabled = new Set(
    unavailableDates
      .map((d) => toDate(d))
      .filter(Boolean)
      .map((d) => format(d, "yyyy-MM-dd"))
  );

  const map = {};
  for (const day of all) {
    const key = format(day, "yyyy-MM-dd");
    map[key] = !disabled.has(key);
  }
  return map;
};

/**
 * Zlicza liczbę dostępnych dni w podanym zakresie
 * @param {Record<string, boolean>} availabilityMap
 * @returns {number}
 */
export const countAvailableDays = (availabilityMap = {}) => {
  return Object.values(availabilityMap).filter(Boolean).length;
};

/**
 * Aktualizuje mapę dostępności (np. po edycji) – przełącza stan dnia.
 * @param {Record<string, boolean>} map
 * @param {Date|string|number} date
 * @returns {Record<string, boolean>}
 */
export const toggleAvailability = (map = {}, date) => {
  const d = toDate(date);
  if (!d) return { ...map };
  const key = format(d, "yyyy-MM-dd");
  return {
    ...map,
    [key]: !map[key],
  };
};

export default { buildAvailabilityMap, countAvailableDays, toggleAvailability };
