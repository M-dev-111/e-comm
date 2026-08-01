import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

/* Fail at boot with a readable message rather than at the first request
   with an opaque 500 from deep inside the Google SDK. */
/* Model families that are NOT available on the free tier. Verified against
   this key: Pro models return "free_tier_input_token_count, limit: 0".
   The app must stay free to run, so these are rejected at boot. */
export const PAID_ONLY = /(-pro|deep-research|veo-|imagen-|lyria-|nano-banana|computer-use)/i;

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

    /* RBAC / SaaS layer. MONGO_URI is intentionally optional: without it the
       server still boots and the existing AI routes keep working, but every
       auth/admin/vendor/customer route responds 503 until it's set. */
    MONGO_URI: z.string().trim().optional(),

    JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters."),
    JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters."),
    JWT_ACCESS_TTL: z.string().default("15m"),
    JWT_REFRESH_TTL: z.string().default("30d"),

    SUPER_ADMIN_EMAIL: z.string().trim().toLowerCase().email().default("super.dibyendu@yopmail.com"),
    SUPER_ADMIN_PASSWORD: z.string().min(8).default("superdibyendu@123"),

    // SMTP is optional too: without it, generated credentials are logged to
    // the server console instead of emailed, so admin/vendor creation still works in dev.
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    MAIL_FROM: z.string().default("mCOM <no-reply@mcom.local>"),

    // Used to build login links inside credential emails.
    FRONTEND_URL: z.string().default("http://localhost:5173")
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
    corsOrigins: parsed.data.CORS_ORIGIN.split(",").map(o => o.trim()).filter(Boolean),
    smtpConfigured: Boolean(parsed.data.SMTP_HOST && parsed.data.SMTP_USER && parsed.data.SMTP_PASS)
};
