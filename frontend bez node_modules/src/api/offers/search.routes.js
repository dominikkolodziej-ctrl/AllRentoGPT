import { Router } from "express";
import { searchOffers } from "../controllers/offerSearch.controller.js";
const router = Router();
router.get("/offers/search", searchOffers);
export default router;
