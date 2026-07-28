import { verifyToken } from "../utils/token.js";
import User from "../models/User.js";

/**
 * Authenticate a request from its `Authorization: Bearer <token>` header.
 * On success attaches a fresh `req.user` (re-read from the DB every request so
 * a disabled account or changed role takes effect immediately, not in 7 days).
 */
export async function authenticate (req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: "Authentication required." });
    }

    let payload;
    try {
        payload = verifyToken(token);
    } catch {
        return res.status(401).json({ error: "Invalid or expired session. Please sign in again." });
    }

    const user = await User.findById(payload.sub).populate("company", "name slug status plan");
    if (!user || user.status === "disabled") {
        return res.status(401).json({ error: "Account not found or disabled." });
    }

    // A suspended company locks out everyone in it except the super admin.
    if (user.role !== "superadmin" && user.company && user.company.status === "suspended") {
        return res.status(403).json({ error: "This company account is suspended." });
    }

    req.user = user;
    // The tenant id used to scope every downstream query.
    req.companyId = user.company ? String(user.company._id) : null;
    next();
}
