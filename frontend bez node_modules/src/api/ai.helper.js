// Ścieżka: src/api/ai.helper.js

import { Router } from "express";

const router = Router();

router.post("/suggest", (req, res) => {
  try {
    const { text } = req.body;

    // symulacja AI
    const mockTags = ["📦 Logistyka", "🚗 Transport", "⭐ Premium", "📍 Lokalny"];
    const selected = mockTags.filter((tag, i) => text.length % (i + 2) === 0);

    res.json(selected.length ? selected : [mockTags[0]]);
  } catch (err) {
    res.status(500).json({ error: "AI suggestion error", detail: err.message });
  }
});

export default router;
