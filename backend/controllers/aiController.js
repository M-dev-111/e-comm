import { GoogleGenerativeAI } from "@google/generative-ai";
import { env, PAID_ONLY } from "../config/env.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const DEFAULT_MODEL = env.GEMINI_MODEL;

/** Maps a Google SDK error onto an HTTP status we can pass through. */
function statusFrom (error) {
    const raw = error?.status ?? error?.response?.status;
    if (Number.isInteger(raw) && raw >= 400 && raw < 600) return raw;
    if (/quota|rate limit/i.test(error?.message || "")) return 429;
    return 502;
}

/** POST /api/ai/ask — body already validated by the askSchema middleware. */
export const askAI = async (req, res, next) => {
    const { message, model: requested } = req.body;

    /* The client may only request a free-tier model. Without this check
       a caller could pass model="gemini-2.5-pro" directly to the API and
       bypass the free-tier guarantee that GEMINI_MODEL is validated for. */
    if (requested && PAID_ONLY.test(requested)) {
        const err = new Error("That model is paid-tier only and cannot be requested here.");
        err.status = 400;
        return next(err);
    }

    const modelName = requested || DEFAULT_MODEL;

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(message);

        res.json({
            reply: result.response.text(),
            model: modelName,
            usage: result.response.usageMetadata ?? null
        });
    } catch (error) {
        error.status = statusFrom(error);
        next(error);
    }
};

/** GET /api/ai/health — cheap probe the frontend uses to confirm the key. */
export const healthAI = async (_req, res, next) => {
    try {
        const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
        const result = await model.generateContent("Reply with exactly: OK");
        res.json({ ok: true, model: DEFAULT_MODEL, reply: result.response.text().trim() });
    } catch (error) {
        error.status = statusFrom(error);
        next(error);
    }
};
