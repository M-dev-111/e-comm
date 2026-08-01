import Company from "../models/Company.js";
import Product from "../models/Product.js";

/** GET /api/products — public storefront catalogue for one tenant. */
export const listProducts = async (req, res, next) => {
    const { tenant, category, brand, tag, q, minPrice, maxPrice, page, limit } = req.validatedQuery;

    try {
        const company = await Company.findOne({ slug: tenant, status: "active" }).select("_id");
        if (!company) return res.status(404).json({ error: "Store not found." });

        const filter = { company: company._id, status: "active" };
        if (category) filter.category = category;
        if (brand) filter.brand = brand;
        if (tag) filter.tags = tag;
        if (q) filter.$text = { $search: q };
        if (minPrice != null || maxPrice != null) {
            filter.price = {};
            if (minPrice != null) filter.price.$gte = minPrice;
            if (maxPrice != null) filter.price.$lte = maxPrice;
        }

        const [products, total] = await Promise.all([
            Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
            Product.countDocuments(filter)
        ]);

        res.json({ products, total, page, limit });
    } catch (error) {
        next(error);
    }
};

/** GET /api/products/:id — public product detail. Only ever resolves active products of active stores. */
export const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product || product.status !== "active") {
            return res.status(404).json({ error: "Product not found." });
        }

        const storeActive = await Company.exists({ _id: product.company, status: "active" });
        if (!storeActive) return res.status(404).json({ error: "Product not found." });

        res.json({ product });
    } catch (error) {
        next(error);
    }
};
