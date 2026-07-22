import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* gemini-1.5-flash and gemini-2.5-flash are both retired for new keys.
   "gemini-flash-latest" is an alias that always points at the current
   free-tier flash model, so this won't 404 again on the next rotation. */
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

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
