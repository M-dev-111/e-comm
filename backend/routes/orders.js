import express from "express";
import {
    createOrder, listOrders, getOrder, updateOrderStatus
} from "../controllers/orderController.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { createOrderSchema, updateOrderStatusSchema } from "../schemas/saas.schema.js";

const router = express.Router();

router.use(authenticate);

router.get("/", listOrders);
router.get("/:id", getOrder);
router.post("/", requireRole("customer"), validate(createOrderSchema), createOrder);
router.patch("/:id/status", requireRole("admin", "vendor"), validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
