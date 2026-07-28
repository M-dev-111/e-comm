/**
 * Zod validation middleware.
 *
 * Replaces the hand-rolled `if (!message)` checks in controllers so every
 * route rejects bad input the same way, with the same error shape:
 *   { error: "Validation failed", issues: [{ path, message }] }
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

    // Hand the parsed (coerced, stripped) value onward — never the raw input.
    req[source] = result.data;
    next();
};

/** 404 for unmatched routes, so the SPA never gets HTML where it wants JSON. */
export const notFound = (req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

/** Terminal error handler — must keep all four args for Express to detect it. */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
    // Mongoose duplicate key → 409 with the offending field.
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || { value: 1 })[0];
        return res.status(409).json({ error: `That ${field} is already taken.`, field });
    }
    // Mongoose schema validation → 400 with per-field messages.
    if (err.name === "ValidationError") {
        return res.status(400).json({
            error: "Validation failed",
            issues: Object.values(err.errors).map(e => ({ path: e.path, message: e.message }))
        });
    }
    // Bad ObjectId in a route param → 400 rather than a 500.
    if (err.name === "CastError") {
        return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
    }

    const status = Number.isInteger(err.status) ? err.status : 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ error: err.message || "Internal server error" });
};
