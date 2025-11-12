// Ścieżka: src/api/usage.js
import { Router } from "express";

// TODO [MISSING: hook + admin chart panel for usage]

const router = Router();

const usageData = [
  { feature: "wyszukiwanie", count: 154 },
  { feature: "filtrowanie", count: 98 },
  { feature: "rezerwacje", count: 42 },
  { feature: "edytowanie ofert", count: 12 },
  { feature: "eksport danych", count: 6 }
];

router.get("/", (req, res) => {
  try {
    res.json(usageData);
  } catch (err) {
    res.status(500).json({ error: "Usage data fetch failed", detail: err.message });
  }
});

export default router;