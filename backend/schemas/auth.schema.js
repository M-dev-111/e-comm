import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email("Enter a valid email."),
    password: z.string().min(1, "Password is required.")
});

export const registerCustomerSchema = z.object({
    name: z.string().trim().min(1, "Name is required.").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    tenantSlug: z.string().trim().toLowerCase().min(1, "tenantSlug is required.")
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "New password must be at least 8 characters.")
}).refine(v => v.currentPassword !== v.newPassword, {
    message: "New password must differ from the current one.",
    path: ["newPassword"]
});

export const vendorApplicationSchema = z.object({
    businessName: z.string().trim().min(1, "Business name is required.").max(120),
    note: z.string().trim().max(500).optional()
});
