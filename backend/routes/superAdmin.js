import express from "express";
import {
    createCompany,
    listCompanies,
    updateCompanyStatus,
    createUser,
    listUsers,
    listVendorApplications,
    decideVendorApplication
} from "../controllers/superAdminController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { requireDb } from "../config/db.js";
import { validate, validateObjectId } from "../middleware/validate.js";
import { createCompanySchema, updateCompanyStatusSchema } from "../schemas/company.schema.js";
import {
    createUserSchema,
    decideVendorApplicationSchema,
    listUsersQuerySchema,
    listQuerySchema
} from "../schemas/user.schema.js";

const router = express.Router();

router.use(authenticate, authorize("super_admin"), requireDb);

router.post("/companies", validate(createCompanySchema), createCompany);
router.get("/companies", validate(listQuerySchema, "query"), listCompanies);
router.patch("/companies/:id/status", validateObjectId(), validate(updateCompanyStatusSchema), updateCompanyStatus);

router.post("/users", validate(createUserSchema), createUser);
router.get("/users", validate(listUsersQuerySchema, "query"), listUsers);

router.get("/vendor-applications", validate(listQuerySchema, "query"), listVendorApplications);
router.patch(
    "/vendor-applications/:userId",
    validateObjectId("userId"),
    validate(decideVendorApplicationSchema),
    decideVendorApplication
);

export default router;
