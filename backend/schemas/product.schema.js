import { z } from "zod";

const specs = z.record(z.string(), z.string()).optional();
const stringList = z.array(z.string().trim().min(1)).optional();

export const createProductSchema = z.object({
    name: z.string().trim().min(1, "Name is required.").max(140),
    description: z.string().trim().min(1, "Description is required.").max(4000),
    brand: z.string().trim().min(1, "Brand is required.").max(60),
    category: z.string().trim().toLowerCase().min(1, "Category is required.").max(40),
    tags: stringList,
    price: z.coerce.number().positive("Price must be greater than 0."),
    mrp: z.coerce.number().positive("MRP must be greater than 0."),
    stock: z.coerce.number().int().min(0).default(0),
    deliveryDays: z.coerce.number().int().min(0).max(30).default(3),
    images: z.array(z.string().trim().url("Each image must be a URL.")).min(1, "At least one image is required."),
    colors: stringList,
    sizes: stringList,
    highlights: stringList,
    specs
}).refine(v => v.mrp >= v.price, {
    message: "MRP cannot be lower than the selling price.",
    path: ["mrp"]
});

export const updateProductSchema = z.object({
    name: z.string().trim().min(1).max(140).optional(),
    description: z.string().trim().min(1).max(4000).optional(),
    brand: z.string().trim().min(1).max(60).optional(),
    category: z.string().trim().toLowerCase().min(1).max(40).optional(),
    tags: stringList,
    price: z.coerce.number().positive().optional(),
    mrp: z.coerce.number().positive().optional(),
    stock: z.coerce.number().int().min(0).optional(),
    deliveryDays: z.coerce.number().int().min(0).max(30).optional(),
    images: z.array(z.string().trim().url("Each image must be a URL.")).min(1).optional(),
    colors: stringList,
    sizes: stringList,
    highlights: stringList,
    specs,
    status: z.enum(["active", "inactive"]).optional()
});

const pagination = {
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(200).default(50)
};

/** Public GET /api/products — tenant is required, everything else narrows it further. */
export const listPublicProductsSchema = z.object({
    tenant: z.string().trim().toLowerCase().min(1, "tenant is required."),
    category: z.string().trim().toLowerCase().optional(),
    brand: z.string().trim().optional(),
    tag: z.string().trim().toLowerCase().optional(),
    q: z.string().trim().max(100).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    ...pagination
});

/** GET /api/vendor/products — no tenant param, the vendor's own token supplies it. */
export const listMyProductsSchema = z.object({
    status: z.enum(["active", "inactive"]).optional(),
    ...pagination
});
