// Ścieżka: src/api/offer.js

import express from "express";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
let offers = [];

// GET /api/offer/:id
router.get("/:id", (req, res) => {
  try {
    const offer = offers.find(o => o.id === req.params.id);
    if (!offer) return res.status(404).json({ error: "Offer not found" });
    res.json(offer);
  } catch (err) {
    res.status(500).json({ error: "Get offer failed", detail: err.message });
  }
});

// POST /api/offer
router.post("/", (req, res) => {
  try {
    const { title, description, price, images, year, location, companyId, status, audienceType, priority, aiTags } = req.body;
    const newOffer = {
      id: uuidv4(),
      title,
      description,
      price,
      images: images || [],
      year,
      location,
      companyId,
      status: status || "draft",
      audienceType: audienceType || "general",
      priority: priority || "normal",
      aiTags: aiTags || [],
      createdAt: new Date().toISOString()
    };
    offers.push(newOffer);
    res.status(201).json(newOffer);
  } catch (err) {
    res.status(500).json({ error: "Create offer failed", detail: err.message });
  }
});

// PUT /api/offer/:id
router.put("/:id", (req, res) => {
  try {
    const index = offers.findIndex(o => o.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Offer not found" });
    offers[index] = { ...offers[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json(offers[index]);
  } catch (err) {
    res.status(500).json({ error: "Update offer failed", detail: err.message });
  }
});

// DELETE /api/offer/:id
router.delete("/:id", (req, res) => {
  try {
    const index = offers.findIndex(o => o.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Offer not found" });
    const removed = offers.splice(index, 1);
    res.json(removed[0]);
  } catch (err) {
    res.status(500).json({ error: "Delete offer failed", detail: err.message });
  }
});

export default router;
