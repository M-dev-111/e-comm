import express from "express";
import {
    createUser, listUsers, getUser, updateUser, deleteUser
} from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { createUserSchema, updateUserSchema } from "../schemas/saas.schema.js";

const router = express.Router();

router.use(authenticate);

// Only a super admin (creating admins) or an admin (creating vendors/customers)
// may manage accounts; the controller enforces which roles each may create.
router.post("/", requireRole("superadmin", "admin"), validate(createUserSchema), createUser);
router.get("/", requireRole("superadmin", "admin"), listUsers);
router.get("/:id", requireRole("superadmin", "admin"), getUser);
router.patch("/:id", requireRole("superadmin", "admin"), validate(updateUserSchema), updateUser);
router.delete("/:id", requireRole("superadmin", "admin"), deleteUser);

export default router;
