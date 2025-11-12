// Ścieżka: api/alerts.js

import { Router } from "express";
import { alerts } from "../models/alerts.model.js";

const router = Router();

router.get("/alerts", (_, res) => {
  try {
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: "Fetch alerts failed", detail: err.message });
  }
});

router.put("/alerts", (req, res) => {
  try {
    const { id } = req.body;
    const i = alerts.findIndex(a => a.id === id);
    if (i > -1) alerts.splice(i, 1);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Update alerts failed", detail: err.message });
  }
});

export default router;
