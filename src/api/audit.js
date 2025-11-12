// Ścieżka: src/api/audit.js
import { Router } from "express";
import { getAuditLogs } from "../utils/audit.log.js";

const router = Router();

router.get("/", (req, res) => {
  try {
    res.json(getAuditLogs());
  } catch (err) {
    res.status(500).json({ error: "Audit log fetch failed", detail: err.message });
  }
});

export default router;
