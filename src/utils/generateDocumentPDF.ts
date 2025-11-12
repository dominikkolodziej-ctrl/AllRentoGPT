export type GeneratedPDF = {
  name: string;
  content: string[];
  mime: "application/pdf";
  createdAt: string;
};

/**
 * Prosty generator struktury PDF (mock).
 * Zwraca metadane i zawartość tekstową do dalszego przetworzenia.
 */
export const generateDocumentPDF = (type: string, content: unknown): GeneratedPDF => {
  const safeType = (type || "document").toString().trim();
  const name = `${slugify(safeType)}-dokument.pdf`;

  const body = `PDF MOCK: Dokument typu ${safeType} zawiera dane: ${JSON.stringify(content)}`;

  return {
    name,
    content: [body],
    mime: "application/pdf",
    createdAt: new Date().toISOString(),
  };
};

function slugify(input: string): string {
  return input
    .normalize?.("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "document";
}

export default generateDocumentPDF;
