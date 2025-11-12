// src/api/reservationsApi.js
import axios from "axios";

// ---- axios instance (spójny z offersApi.js)
const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// ---- interceptors (Authorization + 401 → /login)
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token && !config.headers?.Authorization) {
      config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
    }
  } catch { /* ignore */ }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 && typeof window !== "undefined") {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
      } catch { /* ignore */ }
      const loc = window.location;
      const here = encodeURIComponent(loc.pathname + loc.search + loc.hash);
      if (!loc.pathname.startsWith("/login")) loc.assign(`/login?returnTo=${here}`);
    }
    return Promise.reject(err);
  }
);

// ---- helpers
function pickId(idLike) {
  return typeof idLike === "object" && idLike !== null
    ? (idLike._id || idLike.id)
    : idLike;
}

// ---- API: Reservations

/** POST /api/reservations  – utworzenie rezerwacji */
export async function createReservation(payload) {
  const body = { ...(payload || {}) };
  const { data } = await api.post("/reservations", body);
  return data;
}

/** GET /api/reservations/my – lista moich rezerwacji */
export async function listMyReservations() {
  const { data } = await api.get("/reservations/my");
  return Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);
}

/** GET /api/reservations/offer/:offerId/availability – niedostępne dni */
export async function getOfferAvailability(offerId) {
  const id = pickId(offerId);
  if (!id) return [];
  try {
    const { data } = await api.get(`/reservations/offer/${id}/availability`);
    return Array.isArray(data?.unavailableDates) ? data.unavailableDates : [];
  } catch {
    return [];
  }
}

/** PATCH /api/reservations/:id/status  – zmiana statusu */
export async function updateReservationStatus(id, { status, reason, meta } = {}) {
  const rid = pickId(id);
  if (!rid) throw new Error("Reservation id required");
  const body = { status, reason, meta };
  const { data } = await api.patch(`/reservations/${rid}/status`, body);
  return data;
}

/** POST /api/reservations/sms/request – wyślij kod SMS */
export async function smsRequest({ reservationId, phone }) {
  const rid = pickId(reservationId);
  const body = { reservationId: rid, phone };
  const { data } = await api.post("/reservations/sms/request", body);
  return data; // oczekiwane: { ok: true } (lub meta dev)
}

/** POST /api/reservations/sms/verify – weryfikuj kod SMS */
export async function smsVerify({ reservationId, code }) {
  const rid = pickId(reservationId);
  const body = { reservationId: rid, code };
  const { data } = await api.post("/reservations/sms/verify", body);
  return data; // np. { verified: true }
}

/** POST /api/reservations/:id/return/confirm – potwierdzenie zwrotu (klient) */
export async function confirmReturn(id) {
  const rid = pickId(id);
  const { data } = await api.post(`/reservations/${rid}/return/confirm`);
  return data;
}

/** POST /api/reservations/:id/return/ack – akceptacja zwrotu (provider) */
export async function ackReturn(id) {
  const rid = pickId(id);
  const { data } = await api.post(`/reservations/${rid}/return/ack`);
  return data;
}

/** (opcjonalnie) GET /api/reservations/health – sanity check */
export async function reservationsHealth() {
  try {
    const { data } = await api.get("/reservations/health");
    return data;
  } catch {
    return { ok: false };
  }
}

export default {
  createReservation,
  listMyReservations,
  getOfferAvailability,
  updateReservationStatus,
  smsRequest,
  smsVerify,
  confirmReturn,
  ackReturn,
  reservationsHealth,
};
