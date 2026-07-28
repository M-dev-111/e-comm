import { asyncHandler } from "../utils/asyncHandler.js";
import { tenantFilter } from "../middleware/rbac.js";
import Product from "../models/Product.js";

const fail = (status, error) => Object.assign(new Error(error), { status });

const present = p => ({
    id: String(p._id),
    name: p.name,
    description: p.description,
    brand: p.brand,
    category: p.category,
    price: p.price,
    mrp: p.mrp ?? null,
    stock: p.stock,
    image: p.image,
    status: p.status,
    company: p.company?._id ? String(p.company._id) : String(p.company),
    vendor: p.vendor?._id
        ? { id: String(p.vendor._id), name: p.vendor.name }
        : { id: String(p.vendor) },
    createdAt: p.createdAt
});

/** Which products this role may see. */
function scopeForRole (req) {
    const filter = tenantFilter(req);
    if (req.user.role === "vendor") filter.vendor = req.user._id;
    if (req.user.role === "customer") filter.status = "active";
    if (req.query.category) filter.category = String(req.query.category).toLowerCase();
    if (req.query.status && req.user.role !== "customer") filter.status = req.query.status;
    return filter;
}

/** POST /api/products — admin or vendor. */
export const createProduct = asyncHandler(async (req, res) => {
    const product = await Product.create({
        ...req.body,
        company: req.companyId,
        vendor: req.user._id // the admin or vendor who created it owns it
    });
    await product.populate("vendor", "name");
    res.status(201).json({ product: present(product) });
});

/** GET /api/products */
export const listProducts = asyncHandler(async (req, res) => {
    const products = await Product.find(scopeForRole(req)).populate("vendor", "name").sort({ createdAt: -1 });
    res.json({ products: products.map(present) });
});

/** GET /api/products/:id */
export const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id, ...scopeForRole(req) }).populate("vendor", "name");
    if (!product) throw fail(404, "Product not found.");
    res.json({ product: present(product) });
});

/** A vendor may only touch their own products; an admin, any in the company. */
async function loadWritable (req) {
    const product = await Product.findOne({ _id: req.params.id, ...tenantFilter(req) });
    if (!product) throw fail(404, "Product not found.");
    if (req.user.role === "vendor" && String(product.vendor) !== String(req.user._id)) {
        throw fail(403, "You can only manage your own products.");
    }
    return product;
}

/** PATCH /api/products/:id */
export const updateProduct = asyncHandler(async (req, res) => {
    const product = await loadWritable(req);
    Object.assign(product, req.body);
    await product.save();
    await product.populate("vendor", "name");
    res.json({ product: present(product) });
});

/** DELETE /api/products/:id */
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await loadWritable(req);
    await product.deleteOne();
    res.json({ ok: true, message: "Product deleted." });
});
