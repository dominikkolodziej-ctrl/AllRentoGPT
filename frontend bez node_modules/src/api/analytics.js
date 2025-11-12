// Ścieżka: src/api/analytics.js

import { Router } from "express";
const router = Router();

router.get("/analytics", (req, res) => {
  try {
    const { firmaId } = req.query;
    // Tymczasowe dane przykładowe
    const mock = {
      firmaId,
      views: 1230,
      submissions: 140,
      avgDuration: 9.3,
      benchmark: 8.4
    };
    res.json(mock);
  } catch (err) {
    res.status(500).json({ error: "Analytics fetch failed", detail: err.message });
  }
});

export default router;
