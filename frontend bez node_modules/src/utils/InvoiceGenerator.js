// src/utils/InvoiceGenerator.js

const PRICE_BY_PLAN = Object.freeze({
  free: 0,
  pro: 99,
  enterprise: 249,
});

export const generateInvoice = (plan) => {
  const name = (typeof plan === "string" && plan.trim()) || "Free";
  const key = name.toLowerCase();
  const amount = PRICE_BY_PLAN[key] ?? 0;

  return {
    plan: name,
    date: new Date().toLocaleDateString(),
    amount,
  };
};

export default generateInvoice;
