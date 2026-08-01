import express from "express";
import { askAI, healthAI } from "../controllers/aiController.js";
import { shopChat } from "../controllers/chatController.js";
import { validate } from "../middleware/validate.js";
import { aiLimiter } from "../middleware/rateLimit.js";
import { askSchema } from "../schemas/ai.schema.js";
import { chatSchema } from "../schemas/chat.schema.js";

const router = express.Router();

router.get("/health", aiLimiter, healthAI);
router.post("/ask", aiLimiter, validate(askSchema), askAI);
router.post("/chat", aiLimiter, validate(chatSchema), shopChat);

export default router;
