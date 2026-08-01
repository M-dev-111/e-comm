import express from "express";
import { submitVendorApplication, myVendorApplication } from "../controllers/customerController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { requireDb } from "../config/db.js";
import { validate } from "../middleware/validate.js";
import { vendorApplicationSchema } from "../schemas/auth.schema.js";

const router = express.Router();

router.use(authenticate, authorize("customer"), requireDb);

router.post("/vendor-application", validate(vendorApplicationSchema), submitVendorApplication);
router.get("/vendor-application", myVendorApplication);

export default router;
