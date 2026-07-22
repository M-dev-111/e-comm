import { z } from "zod";

/** Mirrors frontend/src/lib/schemas.js — keep the two in sync. */
export const askSchema = z.object({
    message: z
        .string()
        .trim()
        .min(1, "Message cannot be empty.")
        .max(2000, "Message must be 2000 characters or fewer."),
    // Optional per-request override; the controller falls back to its default.
    model: z.string().trim().min(1).max(60).optional()
});
