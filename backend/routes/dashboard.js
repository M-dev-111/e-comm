import express from "express";
import { stats } from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", authenticate, stats);

export default router;
