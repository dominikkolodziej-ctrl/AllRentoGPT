import { Router } from "express";
import { stringify } from "csv-stringify/sync";
const router = Router();

router.get("/export/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const { include } = req.query;
    const types = Array.isArray(include) ? include : [include];

    const data = types.map((key) => ({
      key,
      example: `Dane dla ${key} (przykładowe)`
    }));

    if (type === "csv") {
      const csv = stringify(data, { header: true });
      res.setHeader("Content-Disposition", "attachment; filename=dane.csv");
      res.set("Content-Type", "text/csv");
      return res.send(csv);
    }

    if (type === "json") {
      res.setHeader("Content-Disposition", "attachment; filename=dane.json");
      return res.json(data);
    }

    if (type === "pdf") {
      res.set("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=dane.pdf");
      const buffer = Buffer.from("PDF placeholder (tu mógłby być Twój raport)", "utf-8");
      return res.send(buffer);
    }

    return res.status(400).json({ error: "Nieznany format" });
  } catch (err) {
    res.status(500).json({ error: "Export failed", detail: err.message });
  }
});

export default router;
