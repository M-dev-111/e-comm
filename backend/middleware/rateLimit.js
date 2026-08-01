import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

/* Limits stay wired in every environment but no-op under `test`, where the
   suite makes far more calls per minute than a real client ever would. */
const base = {
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: () => env.NODE_ENV === "test"
};

/** Gemini's free tier has a hard daily cap — throttle per IP so one client
 *  (or a scraper hitting the public URL) can't burn the whole quota. */
export const aiLimiter = rateLimit({
    ...base,
    windowMs: 60 * 1000,
    limit: 15,
    message: { error: "Too many AI requests. Please wait a minute and try again." }
});

/** Login/register are prime brute-force and enumeration targets. */
export const authLimiter = rateLimit({
    ...base,
    windowMs: 60 * 1000,
    limit: 10,
    message: { error: "Too many attempts. Please wait a minute and try again." }
});

/** Public and unauthenticated — a generous but real ceiling against scraping. */
export const catalogueLimiter = rateLimit({
    ...base,
    windowMs: 60 * 1000,
    limit: 120,
    message: { error: "Too many requests. Please slow down." }
});
