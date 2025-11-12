// Ścieżka: src/utils/alert.engine.js

export const scanOffer = (offer = {}) => {
  const issues = [];

  const desc = offer.description ?? "";
  if (!desc || desc.length < 20) issues.push("Opis zbyt krótki");
  if (!Array.isArray(offer.images) || offer.images.length === 0) issues.push("Brak zdjęć");
  if (!offer.companyId) issues.push("Brak firmy przypisanej");
  const title = typeof offer.title === "string" ? offer.title.toLowerCase() : "";
  if (title.includes("test")) issues.push("Testowy tytuł");

  return issues;
};

export default scanOffer;
