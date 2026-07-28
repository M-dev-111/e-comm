import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

/* Fail at boot with a readable message rather than at the first request
   with an opaque 500 from deep inside the Google SDK. */
/* Model families that are NOT available on the free tier. Verified against
   this key: Pro models return "free_tier_input_token_count, limit: 0".
   The app must stay free to run, so these are rejected at boot. */
const PAID_ONLY = /(-pro|deep-research|veo-|imagen-|lyria-|nano-banana|computer-use)/i;

const envSchema = z.object({
    GEMINI_API_KEY: z.string().min(10, "GEMINI_API_KEY is missing or too short."),
    /* MUST stay on a free-tier model. gemini-flash-lite-latest is the fastest
       free alias (~1.6s) and has a far higher free daily quota than
       gemini-flash-latest, which resolves to a Pro-adjacent model capped at
       20 free requests. Do not pin a Pro model here — it is paid-tier only. */
    GEMINI_MODEL: z
        .string()
        .default("gemini-flash-lite-latest")
        .refine(m => !PAID_ONLY.test(m), {
            message:
                "This model family is paid-tier only and would fail (or bill) on a free key. " +
                "Use a free Flash model such as gemini-flash-lite-latest."
        }),
    PORT: z.coerce.number().int().positive().default(5000),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    // Comma-separated list of allowed browser origins.
    CORS_ORIGIN: z.string().default("http://localhost:5173"),

    /* Database. "memory" spins up an in-process MongoDB (dev/demo only —
       data resets on restart, auto-seeded on boot). For real use, point this
       at a local mongod or a MongoDB Atlas connection string. */
    MONGO_URI: z.string().min(1).default("memory"),

    /* Auth. JWT_SECRET MUST be set to a long random string in production;
       the insecure default is rejected when NODE_ENV=production below. */
    JWT_SECRET: z.string().min(1).default("dev-only-insecure-change-me"),
    JWT_EXPIRES: z.string().default("7d"),

    /* First super admin, created by the seed script if it does not exist. */
    SUPERADMIN_EMAIL: z.string().email().default("super@mcom.dev"),
    SUPERADMIN_PASSWORD: z.string().min(6).default("super1234")
}).superRefine((val, ctx) => {
    if (val.NODE_ENV === "production" && val.JWT_SECRET === "dev-only-insecure-change-me") {
        ctx.addIssue({
            path: ["JWT_SECRET"],
            code: "custom",
            message: "JWT_SECRET must be set to a strong secret in production."
        });
    }
    if (val.NODE_ENV === "production" && val.MONGO_URI === "memory") {
        ctx.addIssue({
            path: ["MONGO_URI"],
            code: "custom",
            message: "MONGO_URI cannot be 'memory' in production — use a real MongoDB URI."
        });
    }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Invalid environment configuration:");
    for (const issue of parsed.error.issues) {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
}

export const env = {
    ...parsed.data,
    corsOrigins: parsed.data.CORS_ORIGIN.split(",").map(o => o.trim()).filter(Boolean)
};
