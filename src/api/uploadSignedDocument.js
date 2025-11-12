// Ścieżka: src/api/uploadSignedDocument.js
// Klient do uploadu podpisanego dokumentu → backend /api/signatures
// Zero Express w froncie, zero console.log — zgodnie z enterprise.

export async function uploadSignedDocument(file, method, extra = {}) {
  if (!file) throw new Error("Brak pliku");
  if (!method) throw new Error("Brak metody podpisu");

  const fd = new FormData();
  fd.append("file", file);
  fd.append("method", method);
  Object.entries(extra || {}).forEach(([k, v]) => fd.append(k, String(v)));

  const res = await fetch("/api/signatures/upload", {
    method: "POST",
    body: fd,
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Upload failed: ${res.status} ${msg}`);
  }
  return res.json();
}

export default { uploadSignedDocument };
