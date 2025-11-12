// FRONT client for offer search — calls BE endpoints and normalizes shape
import axios from "axios";

/** GET /api/offers/search  → { items, total, limit, offset } */
export async function searchOffers(params = {}) {
  const { data } = await axios.get("/api/offers/search", { params });
  const items = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data?.rows)
    ? data.rows
    : Array.isArray(data)
    ? data
    : [];

  const total =
    Number(data?.total ?? data?.pagination?.total ?? items.length);

  const limit =
    Number(params?.limit ?? data?.pagination?.limit ?? 20);

  const offset =
    Number(params?.offset ?? data?.pagination?.offset ?? 0);

  return { items, total, limit, offset };
}

/** GET /api/offers/suggest?q=... -> string[] */
export async function searchSuggest(q) {
  const { data } = await axios.get("/api/offers/suggest", { params: { q } });
  return Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
}

/** GET /api/offers/near?lat=&lng=&radiusKm= -> { items, total } */
export async function searchByGeo({ lat, lng, radiusKm = 25, ...rest } = {}) {
  const { data } = await axios.get("/api/offers/near", {
    params: { lat, lng, radiusKm, ...rest },
  });
  const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  return { items, total: items.length };
}
