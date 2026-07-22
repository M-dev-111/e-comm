import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

/* Gemini structured output. Kept flat (no nested criteria object) because
   deeply nested response schemas are noticeably less reliable. */
const responseSchema = {
    type: "OBJECT",
    properties: {
        reply: { type: "STRING" },
        intent: { type: "STRING", enum: ["shopping", "grocery", "smalltalk", "unclear"] },
        category: { type: "STRING" },
        brand: { type: "STRING" },
        budgetMin: { type: "NUMBER" },
        budgetMax: { type: "NUMBER" },
        priority: { type: "STRING" },
        extras: { type: "ARRAY", items: { type: "STRING" } },
        showProducts: { type: "BOOLEAN" },
        chips: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    label: { type: "STRING" },
                    value: { type: "STRING" },
                    field: {
                        type: "STRING",
                        enum: ["category", "brand", "budget", "priority", "extra", "freetext", "nav"]
                    }
                },
                required: ["label", "value", "field"]
            }
        }
    },
    required: ["reply", "intent", "showProducts"]
};

function systemInstruction (vocabulary, criteria) {
    const categories = vocabulary.categories.map(c => `${c.id} (${c.label})`).join(", ");
    const priorities = vocabulary.priorities.map(p => `${p.id} (${p.label})`).join(", ");
    const extras = vocabulary.extras.map(e => `${e.id} (${e.label})`).join(", ");

    return `You are the shopping assistant for mCOM, an Indian e-commerce store. You help a customer narrow down what to buy by having a short, friendly conversation.

CATALOGUE VOCABULARY — you may ONLY use these exact ids:
- category: ${categories}
- brand: ${vocabulary.brands.join(", ")}
- priority: ${priorities}
- extras: ${extras}

WHAT YOU KNOW SO FAR (carry these forward unless the customer changes them):
${JSON.stringify(criteria)}

YOUR JOB:
1. Read the customer's message and work out which slots you can fill: category, brand, budgetMin/budgetMax, priority, extras.
2. Return every slot you are confident about. Omit a field entirely if you are not confident — never guess a brand or category that is not in the vocabulary above.
2a. BUDGET IS CRITICAL: whenever the customer mentions any amount, you MUST return it as budgetMin/budgetMax numbers in rupees. "under 30k", "below ₹30,000", "max 30000", "nothing over 30000" and "not more than 30k" all mean budgetMax=30000. "at least 5000" and "above 5000" mean budgetMin=5000. "between 10k and 20k" means budgetMin=10000, budgetMax=20000. Never mention a budget in your reply without also returning the numbers.
3. Write a "reply": warm, concise, at most two short sentences. Ask for ONE missing detail at a time, in this order: category, then brand, then budget, then priority. Never ask about something you already know.
4. Set "showProducts" to true once you know at least the category AND (a budget or a brand or a priority) — or whenever the customer asks to just see options. The app then renders real product cards itself.
5. Provide 2-5 "chips" — tappable one-tap answers to the question you just asked. Each chip's "value" MUST be a valid id from the vocabulary (for budget, use a plain number of rupees like "20000"; for freetext, any short phrase).

INTENT:
- "grocery" if they want food/groceries — those live in mCOM Dash, a separate 8-minute delivery tab, not this catalogue.
- "smalltalk" for greetings or thanks.
- "unclear" if you genuinely cannot tell what they want.
- "shopping" otherwise.

HARD RULES:
- NEVER invent, name, or describe a specific product, price, model number or spec. You do not have the product list. The app selects and displays the actual products. Say "here are the best matches" — never "the Nexa X1 at ₹18,999".
- Prices are Indian rupees. Write them as ₹20,000.
- Do not use markdown, bullet points, or emoji in "reply". Plain sentences only.
- Keep "reply" under 220 characters.`;
}

/** Drop anything the model invented that is not in the client's vocabulary. */
function sanitise (raw, vocabulary) {
    const categoryIds = new Set(vocabulary.categories.map(c => c.id));
    const priorityIds = new Set(vocabulary.priorities.map(p => p.id));
    const extraIds = new Set(vocabulary.extras.map(e => e.id));
    // Brands are matched case-insensitively, then normalised to the catalogue spelling.
    const brandBy = new Map(vocabulary.brands.map(b => [b.toLowerCase(), b]));

    const criteria = {};
    if (raw.category && categoryIds.has(raw.category)) criteria.category = raw.category;
    if (raw.brand && brandBy.has(String(raw.brand).toLowerCase())) {
        criteria.brand = brandBy.get(String(raw.brand).toLowerCase());
    }
    if (raw.priority && priorityIds.has(raw.priority)) criteria.priority = raw.priority;

    if (Array.isArray(raw.extras)) {
        const kept = raw.extras.filter(e => extraIds.has(e));
        if (kept.length) criteria.extras = kept;
    }

    const min = Number(raw.budgetMin);
    const max = Number(raw.budgetMax);
    const hasMin = Number.isFinite(min) && min > 0;
    const hasMax = Number.isFinite(max) && max > 0;
    if (hasMin || hasMax) {
        criteria.budget = { min: hasMin ? min : 0, max: hasMax ? max : null };
    }

    const chips = (Array.isArray(raw.chips) ? raw.chips : [])
        .filter(c => c && typeof c.label === "string" && typeof c.value === "string")
        .filter(c => {
            if (c.field === "category") return categoryIds.has(c.value);
            if (c.field === "priority") return priorityIds.has(c.value);
            if (c.field === "extra") return extraIds.has(c.value);
            if (c.field === "brand") return brandBy.has(c.value.toLowerCase()) || c.value === "any";
            if (c.field === "budget") return Number.isFinite(Number(c.value)) || c.value === "any";
            return c.field === "freetext" || c.field === "nav";
        })
        .slice(0, 5)
        .map(c => ({ ...c, label: c.label.slice(0, 40) }));

    return {
        reply: String(raw.reply || "").slice(0, 400),
        intent: ["shopping", "grocery", "smalltalk", "unclear"].includes(raw.intent) ? raw.intent : "shopping",
        showProducts: Boolean(raw.showProducts),
        criteria,
        chips
    };
}

/** POST /api/ai/chat — one conversational turn of the shopping assistant. */
export const shopChat = async (req, res, next) => {
    const { message, history, criteria, vocabulary } = req.body;

    try {
        const model = genAI.getGenerativeModel({
            model: env.GEMINI_MODEL,
            systemInstruction: systemInstruction(vocabulary, criteria),
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema,
                temperature: 0.7,
                /* gemini-flash-latest is a thinking model and reasoning tokens
                   count towards this ceiling. Too low and the JSON is truncated
                   mid-object, which surfaces as a parse error. (thinkingConfig
                   is not supported by this SDK version, so headroom it is.) */
                maxOutputTokens: 3000
            }
        });

        const result = await model.generateContent({
            contents: [
                // Gemini requires the first turn to be from "user".
                ...history
                    .filter((m, i) => !(i === 0 && m.role === "bot"))
                    .map(m => ({ role: m.role === "bot" ? "model" : "user", parts: [{ text: m.text }] })),
                { role: "user", parts: [{ text: message }] }
            ]
        });

        const text = result.response.text();

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            const reason = result.response.candidates?.[0]?.finishReason;
            console.error("Assistant JSON parse failed", { reason, text: text.slice(0, 300) });
            const err = new Error(
                reason === "MAX_TOKENS"
                    ? "The assistant's answer was cut short. Please try a shorter question."
                    : "The assistant returned an unreadable response."
            );
            err.status = 502;
            throw err;
        }

        res.json(sanitise(parsed, vocabulary));
    } catch (error) {
        if (!error.status) {
            const raw = error?.status ?? error?.response?.status;
            error.status = Number.isInteger(raw) ? raw : /quota|rate limit/i.test(error.message || "") ? 429 : 502;
        }
        next(error);
    }
};
