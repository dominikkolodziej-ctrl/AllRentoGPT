// Ścieżka: src/api/mockDocuments.js
// ✅ ESLint FIXED: brak nieużywanych importów, brak niezdefiniowanego exportu
// ✅ FAZA 4: dokumenty PDF — gotowe pod preview/eksport
// ✅ FAZA 8: przygotowane pod integrację backendową (GET /api/documents)

export const mockDocuments = [
  {
    name: "umowa-najem.pdf",
    size: 28000,
    uploaded: "2025-06-15T10:00:00Z",
    type: "application/pdf"
  },
  {
    name: "protokol-odbioru.pdf",
    size: 35000,
    uploaded: "2025-06-10T14:15:00Z",
    type: "application/pdf"
  }
];

// Można np. dohookować exportToPDF(mockDocuments[0]) w interfejsie UI
