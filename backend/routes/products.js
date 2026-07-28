import express from "express";
import {
    createProduct, listProducts, getProduct, updateProduct, deleteProduct
} from "../controllers/productController.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { createProductSchema, updateProductSchema } from "../schemas/saas.schema.js";

const router = express.Router();

router.use(authenticate);

// Any authenticated member of a company may browse; only admin/vendor may write.
router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", requireRole("admin", "vendor"), validate(createProductSchema), createProduct);
router.patch("/:id", requireRole("admin", "vendor"), validate(updateProductSchema), updateProduct);
router.delete("/:id", requireRole("admin", "vendor"), deleteProduct);

export default router;
