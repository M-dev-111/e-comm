import { z } from "zod";

const idLabel = z.object({
    id: z.string().min(1).max(40),
    label: z.string().min(1).max(60)
});

/**
 * The client sends its own vocabulary (categories, brands, priorities) with
 * every turn. That keeps frontend/src/data/data.js the single source of
 * truth — the backend never holds a second copy of the catalogue that can
 * drift out of sync.
 */
export const chatSchema = z.object({
    message: z.string().trim().min(1, "Message cannot be empty.").max(500),

    history: z
        .array(
            z.object({
                role: z.enum(["user", "bot"]),
                text: z.string().max(1200)
            })
        )
        .max(20)
        .default([]),

    criteria: z
        .object({
            category: z.string().max(40).nullish(),
            brand: z.string().max(60).nullish(),
            budgetMin: z.number().nonnegative().nullish(),
            budgetMax: z.number().nonnegative().nullish(),
            priority: z.string().max(40).nullish(),
            extras: z.array(z.string().max(40)).max(8).nullish()
        })
        .default({}),

    vocabulary: z.object({
        categories: z.array(idLabel).max(40),
        brands: z.array(z.string().max(60)).max(80),
        priorities: z.array(idLabel).max(40),
        extras: z.array(idLabel).max(20)
    })
});
