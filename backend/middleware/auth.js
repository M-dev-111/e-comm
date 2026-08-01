import { verifyAccessToken } from "../utils/token.js";

/** Reads the Bearer access token, verifies it, and attaches req.auth. */
export function authenticate (req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: "Not authenticated." });
    }

    try {
        req.auth = verifyAccessToken(token);
        next();
    } catch {
        res.status(401).json({ error: "Session expired or invalid. Please log in again." });
    }
}

/** Restricts a route to one or more roles. Use after authenticate. */
export const authorize = (...roles) => (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
        return res.status(403).json({ error: "You do not have permission to do that." });
    }
    next();
};
