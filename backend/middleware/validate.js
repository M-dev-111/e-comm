import { env } from "../config/env.js";

/**
 * Zod validation middleware.
 *
 * Replaces the hand-rolled `if (!message)` checks in controllers so every
 * route rejects bad input the same way, with the same error shape:
 *   { error: "Validation failed", issues: [{ path, message }] }
 *
 * Query strings are parsed by Express 5's "simple" parser, so a repeated key
 * (?role=a&role=b) arrives as an array. Validating it here keeps those out of
 * Mongoose, where they would otherwise blow up as a CastError 500.
 */
export const validate = (schema, source = "body") => (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
        return res.status(400).json({
            error: "Validation failed",
            issues: result.error.issues.map(i => ({
                path: i.path.join("."),
                message: i.message
            }))
        });
    }

    /* req.query is a getter on some Express versions — never assign to it.
       Validated query lands on req.validatedQuery, which controllers read. */
    if (source === "query") req.validatedQuery = result.data;
    else req[source] = result.data;

    next();
};

/** Rejects a malformed :id before Mongoose turns it into an opaque 500. */
export const validateObjectId = (param = "id") => (req, res, next) => {
    if (!/^[a-f\d]{24}$/i.test(req.params[param] ?? "")) {
        return res.status(400).json({ error: `Invalid ${param}.` });
    }
    next();
};

/** 404 for unmatched routes, so the SPA never gets HTML where it wants JSON. */
export const notFound = (req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

/** Human-readable message for a Mongo duplicate-key error on a specific field. */
function duplicateKeyMessage (err) {
    const field = Object.keys(err.keyPattern ?? {}).filter(f => f !== "company")[0];
    if (field === "email") return "An account with that email already exists.";
    if (field === "slug") return "That company name is already taken.";
    return "That record already exists.";
}

/** Terminal error handler — must keep all four args for Express to detect it. */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
    // Mongo/Mongoose failures arrive without a status; map them before defaulting to 500.
    if (err.code === 11000) {
        return res.status(409).json({ error: duplicateKeyMessage(err) });
    }
    if (err.name === "CastError") {
        return res.status(400).json({ error: `Invalid value for ${err.path}.` });
    }
    if (err.name === "ValidationError") {
        return res.status(400).json({ error: err.message });
    }

    const status = Number.isInteger(err.status) ? err.status : 500;
    if (status >= 500) console.error(err);

    /* Never leak internal messages (driver errors can embed connection details).
       4xx messages are ours and safe to pass through. */
    const message = status >= 500 && env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error";

    res.status(status).json({ error: message });
};
