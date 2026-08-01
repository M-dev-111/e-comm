import express from "express";
import {
    createProduct,
    listMyProducts,
    getMyProduct,
    updateProduct,
    deleteProduct
} from "../controllers/vendorProductController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { requireDb } from "../config/db.js";
import { validate, validateObjectId } from "../middleware/validate.js";
import { createProductSchema, updateProductSchema, listMyProductsSchema } from "../schemas/product.schema.js";

const router = express.Router();

router.use(authenticate, authorize("vendor"), requireDb);

router.post("/", validate(createProductSchema), createProduct);
router.get("/", validate(listMyProductsSchema, "query"), listMyProducts);
router.get("/:id", validateObjectId(), getMyProduct);
router.patch("/:id", validateObjectId(), validate(updateProductSchema), updateProduct);
router.delete("/:id", validateObjectId(), deleteProduct);

export default router;
