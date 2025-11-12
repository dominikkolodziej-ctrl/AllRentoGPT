// src/api/MockInvoiceAPI.js

const STORAGE_KEY = "mock_invoices_v1";

/** @typedef {"paid"|"pending"|"failed"|"refunded"|"cancelled"} InvoiceStatus */

/**
 * @typedef {Object} Invoice
 * @property {string} id
 * @property {string} client
 * @property {string|number} amount
 * @property {InvoiceStatus} status
 * @property {string} [currency]
 * @property {string} [issuedAt] ISO date
 */

const seed = [
  { id: "INV001", client: "Jan Kowalski", amount: "129 PLN", status: "paid" },
  { id: "INV002", client: "Acme Corp", amount: "259 PLN", status: "pending" },
  { id: "INV003", client: "Beta Sp. z o.o.", amount: "89 PLN", status: "failed" },
];

const loadStore = () => {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return [...seed];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...seed];
  } catch {
    return [...seed];
  }
};

const saveStore = (list) => {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    /* ignore persistence errors */
  }
};

const getNextId = (list) => {
  const max = list
    .map((i) => Number(String(i.id || "").replace(/\D/g, "")))
    .filter((n) => Number.isFinite(n))
    .reduce((a, b) => Math.max(a, b), 0);
  const next = String(max + 1).padStart(3, "0");
  return `INV${next}`;
};

let store = loadStore();
const undoTokens = new Map();

/** @returns {Promise<Invoice[]>} */
export const getInvoices = async () => {
  return [...store];
};

/** @param {string} id @returns {Promise<Invoice|null>} */
export const getInvoiceById = async (id) => {
  return store.find((i) => i.id === id) || null;
};

/** @param {Partial<Invoice>} invoice @returns {Promise<Invoice>} */
export const createInvoice = async (invoice) => {
  const newInv = {
    id: getNextId(store),
    client: invoice.client || "Nieznany klient",
    amount: invoice.amount ?? "0 PLN",
    status: (invoice.status || "pending"),
    currency: invoice.currency || undefined,
    issuedAt: new Date().toISOString(),
  };
  store = [newInv, ...store];
  saveStore(store);
  return newInv;
};

/** @param {string} id @param {InvoiceStatus} status @returns {Promise<Invoice|null>} */
export const updateInvoiceStatus = async (id, status) => {
  const idx = store.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  store[idx] = { ...store[idx], status };
  saveStore(store);
  return store[idx];
};

/** @param {string} id @returns {Promise<{ok:boolean, undoToken?:string}>} */
export const deleteInvoice = async (id) => {
  const idx = store.findIndex((i) => i.id === id);
  if (idx === -1) return { ok: false };
  const [removed] = store.splice(idx, 1);
  const token = `${id}-${Date.now()}`;
  undoTokens.set(token, removed);
  saveStore(store);
  return { ok: true, undoToken: token };
};

/** @param {string} token @returns {Promise<Invoice|null>} */
export const undoDeleteInvoice = async (token) => {
  const inv = undoTokens.get(token);
  if (!inv) return null;
  if (!store.find((i) => i.id === inv.id)) {
    store = [inv, ...store];
    saveStore(store);
  }
  undoTokens.delete(token);
  return inv;
};

export default {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  undoDeleteInvoice,
};
