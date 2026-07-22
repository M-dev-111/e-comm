import express from "express";
import rateLimit from "express-rate-limit";
import { askAI, healthAI } from "../controllers/aiController.js";
import { shopChat } from "../controllers/chatController.js";
import { validate } from "../middleware/validate.js";
import { askSchema } from "../schemas/ai.schema.js";
import { chatSchema } from "../schemas/chat.schema.js";

const router = express.Router();

/* Gemini's free tier has a hard daily cap — throttle per IP so one
   client (or a scraper hitting the public URL) can't burn the whole quota. */
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 15,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many AI requests. Please wait a minute and try again." }
});

router.get("/health", aiLimiter, healthAI);
router.post("/ask", aiLimiter, validate(askSchema), askAI);
router.post("/chat", aiLimiter, validate(chatSchema), shopChat);

export default router;
