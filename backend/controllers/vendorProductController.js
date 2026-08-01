import Product from "../models/Product.js";
import { uniqueProductSlug } from "../services/products.js";

/** POST /api/vendor/products */
export const createProduct = async (req, res, next) => {
    try {
        const slug = await uniqueProductSlug(req.auth.company, req.body.name);
        const product = await Product.create({
            ...req.body,
            slug,
            company: req.auth.company,
            vendor: req.auth.sub
        });
        res.status(201).json({ product });
    } catch (error) {
        next(error);
    }
};

/** GET /api/vendor/products?status=&page=&limit= — the caller's own products, any status. */
export const listMyProducts = async (req, res, next) => {
    const { status, page, limit } = req.validatedQuery;
    const filter = { vendor: req.auth.sub };
    if (status) filter.status = status;

    try {
        const [products, total] = await Promise.all([
            Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
            Product.countDocuments(filter)
        ]);
        res.json({ products, total, page, limit });
    } catch (error) {
        next(error);
    }
};

/** GET /api/vendor/products/:id — own product, any status. */
export const getMyProduct = async (req, res, next) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, vendor: req.auth.sub });
        if (!product) return res.status(404).json({ error: "Product not found." });
        res.json({ product });
    } catch (error) {
        next(error);
    }
};

/** PATCH /api/vendor/products/:id */
export const updateProduct = async (req, res, next) => {
    try {
        const updates = { ...req.body };
        // Renaming a product doesn't re-slug it — a stable URL matters more than a cosmetic mismatch.
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, vendor: req.auth.sub },
            updates,
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ error: "Product not found." });
        res.json({ product });
    } catch (error) {
        next(error);
    }
};

/** DELETE /api/vendor/products/:id */
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findOneAndDelete({ _id: req.params.id, vendor: req.auth.sub });
        if (!product) return res.status(404).json({ error: "Product not found." });
        res.json({ ok: true });
    } catch (error) {
        next(error);
    }
};
