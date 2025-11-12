// Ścieżka: src/api/healthcheck.js
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  try {
    const ok = true;
    const errorRate = Math.floor(Math.random() * 5); // demo: losowy %

    res.json({
      ok,
      errorRate
    });
  } catch (err) {
    res.status(500).json({ error: "Healthcheck failed", detail: err.message });
  }
});

export default router;
