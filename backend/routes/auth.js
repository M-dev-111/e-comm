import express from "express";
import rateLimit from "express-rate-limit";
import { login, register, me } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../schemas/saas.schema.js";

const router = express.Router();

// Slow down credential-stuffing without blocking honest retries.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many attempts. Please wait a few minutes and try again." }
});

router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/register", authLimiter, validate(registerSchema), register);
router.get("/me", authenticate, me);

export default router;
