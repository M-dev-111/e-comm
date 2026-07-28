import { asyncHandler } from "../utils/asyncHandler.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const fail = (status, error) => Object.assign(new Error(error), { status });

const present = o => ({
    id: String(o._id),
    company: o.company?._id ? String(o.company._id) : String(o.company),
    customer: o.customer?._id
        ? { id: String(o.customer._id), name: o.customer.name, email: o.customer.email }
        : { id: String(o.customer) },
    items: o.items.map(i => ({
        product: String(i.product),
        vendor: String(i.vendor),
        name: i.name,
        price: i.price,
        qty: i.qty
    })),
    total: o.total,
    status: o.status,
    createdAt: o.createdAt
});

/** Which orders this role may see. */
function scopeForRole (req) {
    const { role, companyId } = { role: req.user.role, companyId: req.companyId };
    if (role === "superadmin") return req.query.company ? { company: req.query.company } : {};
    if (role === "admin") return { company: companyId };
    if (role === "vendor") return { company: companyId, vendors: req.user._id };
    return { company: companyId, customer: req.user._id }; // customer
}

/** POST /api/orders — a customer buys from their own store. */
export const createOrder = asyncHandler(async (req, res) => {
    const requested = req.body.items;
    const ids = requested.map(i => i.product);

    // Only active, in-company products are purchasable.
    const products = await Product.find({ _id: { $in: ids }, company: req.companyId, status: "active" });
    const byId = new Map(products.map(p => [String(p._id), p]));

    const items = [];
    for (const line of requested) {
        const product = byId.get(line.product);
        if (!product) throw fail(400, `A product in your cart is unavailable.`);
        if (product.stock < line.qty) throw fail(409, `Only ${product.stock} of "${product.name}" left in stock.`);
        items.push({
            product: product._id,
            vendor: product.vendor,
            name: product.name,
            price: product.price,
            qty: line.qty
        });
    }

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const vendors = [...new Set(items.map(i => String(i.vendor)))];

    // Decrement stock. (A standalone dev DB has no multi-doc transactions;
    // for production on a replica set this loop would move into a session.)
    await Promise.all(items.map(i => Product.updateOne({ _id: i.product }, { $inc: { stock: -i.qty } })));

    const order = await Order.create({
        company: req.companyId,
        customer: req.user._id,
        items,
        total,
        vendors
    });

    res.status(201).json({ order: present(order) });
});

/** GET /api/orders */
export const listOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find(scopeForRole(req))
        .populate("customer", "name email")
        .sort({ createdAt: -1 });

    // A vendor should only see the lines that are theirs, not the whole basket.
    const shaped = orders.map(o => {
        const dto = present(o);
        if (req.user.role === "vendor") {
            dto.items = dto.items.filter(i => i.vendor === String(req.user._id));
            dto.total = dto.items.reduce((s, i) => s + i.price * i.qty, 0);
        }
        return dto;
    });

    res.json({ orders: shaped });
});

/** GET /api/orders/:id */
export const getOrder = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, ...scopeForRole(req) }).populate("customer", "name email");
    if (!order) throw fail(404, "Order not found.");
    res.json({ order: present(order) });
});

/** PATCH /api/orders/:id/status — admin (any) or vendor (only their orders). */
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, ...scopeForRole(req) });
    if (!order) throw fail(404, "Order not found.");

    order.status = req.body.status;
    await order.save();
    await order.populate("customer", "name email");
    res.json({ order: present(order) });
});
