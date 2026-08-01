import { z } from "zod";

export const createCompanySchema = z.object({
    name: z.string().trim().min(1, "Company name is required.").max(120),
    email: z.string().trim().toLowerCase().email("Enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    logo: z.string().trim().url("Logo must be a URL.").optional()
});

export const updateCompanyStatusSchema = z.object({
    status: z.enum(["active", "suspended"])
});
