import express from "express";
import {
    createUser,
    listUsers,
    updateUserStatus,
    listVendorApplications,
    decideVendorApplication
} from "../controllers/adminController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { requireDb } from "../config/db.js";
import { validate, validateObjectId } from "../middleware/validate.js";
import {
    createUserSchema,
    updateUserStatusSchema,
    decideVendorApplicationSchema,
    listUsersQuerySchema,
    listQuerySchema
} from "../schemas/user.schema.js";

const router = express.Router();

router.use(authenticate, authorize("admin"), requireDb);

router.post("/users", validate(createUserSchema), createUser);
router.get("/users", validate(listUsersQuerySchema, "query"), listUsers);
router.patch("/users/:id/status", validateObjectId(), validate(updateUserStatusSchema), updateUserStatus);

router.get("/vendor-applications", validate(listQuerySchema, "query"), listVendorApplications);
router.patch(
    "/vendor-applications/:userId",
    validateObjectId("userId"),
    validate(decideVendorApplicationSchema),
    decideVendorApplication
);

export default router;
