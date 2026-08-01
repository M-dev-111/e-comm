import express from "express";
import { listProducts, getProduct } from "../controllers/productController.js";
import { requireDb } from "../config/db.js";
import { validate, validateObjectId } from "../middleware/validate.js";
import { catalogueLimiter } from "../middleware/rateLimit.js";
import { listPublicProductsSchema } from "../schemas/product.schema.js";

const router = express.Router();

router.use(catalogueLimiter, requireDb);

router.get("/", validate(listPublicProductsSchema, "query"), listProducts);
router.get("/:id", validateObjectId(), getProduct);

export default router;
