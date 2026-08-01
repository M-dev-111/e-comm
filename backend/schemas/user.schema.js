import { z } from "zod";

const objectId = z.string().trim().regex(/^[a-f\d]{24}$/i, "Invalid id.");

/** Used by admin (implicit company) and super admin (explicit companyId). */
export const createUserSchema = z.object({
    name: z.string().trim().min(1, "Name is required.").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email."),
    role: z.enum(["vendor", "customer"]),
    companyId: objectId.optional()
});

export const updateUserStatusSchema = z.object({
    status: z.enum(["active", "suspended"])
});

export const decideVendorApplicationSchema = z.object({
    decision: z.enum(["approved", "rejected"])
});

/* Express 5's "simple" query parser turns a repeated key into an array, which
   Mongoose then rejects as a CastError 500. Validating here keeps list
   endpoints to strings and bounds the page size. */
const pagination = {
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(50)
};

export const listUsersQuerySchema = z.object({
    role: z.enum(["vendor", "customer"]).optional(),
    companyId: objectId.optional(),
    ...pagination
});

export const listQuerySchema = z.object({
    companyId: objectId.optional(),
    ...pagination
});
