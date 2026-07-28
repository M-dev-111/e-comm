import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email address.");
const password = z.string().min(6, "Password must be at least 6 characters.").max(100);
const name = z.string().trim().min(2, "Name must be at least 2 characters.").max(80);
const slug = z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only.");

/* ----------------------------- auth ----------------------------- */

export const loginSchema = z.object({
    email,
    password: z.string().min(1, "Password is required."),
    // Optional: disambiguates a customer who exists on multiple stores.
    companySlug: slug.optional()
});

// Public customer self-registration into an existing store.
export const registerSchema = z.object({
    name,
    email,
    password,
    companySlug: slug
});

/* --------------------------- companies -------------------------- */

// Super admin creates a company and its first admin in one call.
export const createCompanySchema = z.object({
    name: z.string().trim().min(2).max(80),
    slug,
    email: email.optional(),
    phone: z.string().trim().max(20).optional(),
    plan: z.enum(["trial", "basic", "pro"]).default("trial"),
    adminName: name,
    adminEmail: email,
    adminPassword: password
});

export const updateCompanySchema = z
    .object({
        name: z.string().trim().min(2).max(80),
        email: email,
        phone: z.string().trim().max(20),
        plan: z.enum(["trial", "basic", "pro"]),
        status: z.enum(["active", "suspended"])
    })
    .partial()
    .refine(v => Object.keys(v).length > 0, { message: "Nothing to update." });

/* ----------------------------- users ---------------------------- */

// Admin creates vendors/customers; super admin creates admins.
export const createUserSchema = z.object({
    name,
    email,
    password,
    role: z.enum(["admin", "vendor", "customer"]),
    // Only honoured for a super admin creating an admin for a specific company.
    company: z.string().trim().length(24).optional()
});

export const updateUserSchema = z
    .object({
        name,
        password,
        status: z.enum(["active", "disabled"])
    })
    .partial()
    .refine(v => Object.keys(v).length > 0, { message: "Nothing to update." });

/* --------------------------- products --------------------------- */

export const createProductSchema = z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(2000).optional().default(""),
    brand: z.string().trim().max(60).optional().default(""),
    category: z.string().trim().max(40).optional().default("general"),
    price: z.coerce.number().min(0, "Price cannot be negative."),
    mrp: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().int().min(0).optional().default(0),
    image: z.string().trim().url("Image must be a valid URL.").optional().or(z.literal("")),
    status: z.enum(["active", "draft", "archived"]).optional().default("active")
});

export const updateProductSchema = createProductSchema.partial().refine(
    v => Object.keys(v).length > 0,
    { message: "Nothing to update." }
);

/* ---------------------------- orders ---------------------------- */

export const createOrderSchema = z.object({
    items: z
        .array(
            z.object({
                product: z.string().trim().length(24, "Invalid product id."),
                qty: z.coerce.number().int().min(1).max(99)
            })
        )
        .min(1, "Your cart is empty.")
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"])
});
