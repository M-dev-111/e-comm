import express from "express";
import { login, registerCustomer, refresh, logout, me, changePassword } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { loginSchema, registerCustomerSchema, changePasswordSchema } from "../schemas/auth.schema.js";

const router = express.Router();

router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/register", authLimiter, validate(registerCustomerSchema), registerCustomer);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticate, me);
router.post("/change-password", authLimiter, authenticate, validate(changePasswordSchema), changePassword);

export default router;
