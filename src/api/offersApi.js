import axios from "axios";

// ---- axios instance
const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// ---- interceptors (Authorization + 401 redirect)
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token && !config.headers?.Authorization) {
      config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
    }
  } catch {
    // ignore storage errors (privacy modes)
  }
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
      } catch {
        // ignore storage errors
      }
      const loc = window.location;
      const here = encodeURIComponent(loc.pathname + loc.search + loc.hash);
      if (!loc.pathname.startsWith("/login")) {
        loc.assign(`/login?returnTo=${here}`);
      }
    }
    return Promise.reject(err);
  }
);

// ---- helpers
function toQueryParams(params = {}) {
  const out = { ...params };
  if (Array.isArray(out.tags)) out.tags = out.tags.join(",");
  if (out.page != null) out.page = Number(out.page) || 1;
  if (out.limit != null) out.limit = Number(out.limit) || 20;
  if (out.priceMin != null && out.priceMin !== "") out.priceMin = Number(out.priceMin);
  if (out.priceMax != null && out.priceMax !== "") out.priceMax = Number(out.priceMax);
  if (typeof out.onlyPublished === "boolean") out.onlyPublished = out.onlyPublished ? "1" : undefined;
  // przepuszczamy sort, owner, status itd. bez zmian — BE je rozumie
  return out;
}

// ---- API
export async function listOffers(params = {}) {
  try {
    const qp = toQueryParams(params);
    const { data } = await api.get("/offer", { params: qp });
    const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
    const total = typeof data?.total === "number" ? data.total : items.length;
    const page = data?.page ?? qp.page ?? 1;
    const limit = data?.limit ?? qp.limit ?? items.length;
    return { items, total, page, limit };
  } catch (err) {
    console.error("listOffers error:", err);
    return { items: [], total: 0, page: 1, limit: Number(params?.limit) || 20 };
  }
}

// Alias dla starszych wywołań (np. CompanyPublicPage itp.)
export async function getOffers(params = {}) {
  const { items } = await listOffers(params);
  return items;
}

export async function getAllOffers() {
  const { items } = await listOffers({});
  return items;
}

export async function getOfferById(id) {
  try {
    const { data } = await api.get(`/offer/${id}`);
    return data;
  } catch (err) {
    if (err?.response?.status === 404) return null;
    console.error("getOfferById error:", err);
    return null;
  }
}

export async function getOfferAvailability(offerId) {
  try {
    const { data } = await api.get(`/reservations/offer/${offerId}/availability`);
    return Array.isArray(data?.unavailableDates) ? data.unavailableDates : [];
  } catch {
    return [];
  }
}

// --- SEARCH (BE: /api/offer/search) -----------------------------------------
export async function searchOffers(params = {}) {
  try {
    const qp = toQueryParams(params);
    const { data } = await api.get("/offer/search", { params: qp });

    // Obsługa obu formatów: {results,pagination} lub {items,total}
    const items = Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
      ? data
      : [];

    const total = Number(
      data?.pagination?.total ?? data?.total ?? items.length
    );

    const page = Number(qp.page || 1);
    const limit = Number(qp.limit || 20);

    return { items, total, page, limit };
  } catch (err) {
    console.error("searchOffers error:", err);
    return { items: [], total: 0, page: 1, limit: Number(params?.limit) || 20 };
  }
}

export default {
  getOfferById,
  getAllOffers,
  listOffers,
  getOffers,
  getOfferAvailability,
  searchOffers,
};
