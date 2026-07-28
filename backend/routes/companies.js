import express from "express";
import {
    createCompany, listCompanies, getCompany, updateCompany, deleteCompany
} from "../controllers/companyController.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { createCompanySchema, updateCompanySchema } from "../schemas/saas.schema.js";

const router = express.Router();

// The entire company registry is the super admin's alone.
router.use(authenticate, requireRole("superadmin"));

router.post("/", validate(createCompanySchema), createCompany);
router.get("/", listCompanies);
router.get("/:id", getCompany);
router.patch("/:id", validate(updateCompanySchema), updateCompany);
router.delete("/:id", deleteCompany);

export default router;
