import { env } from "../config/env.js";
import { isDbReady } from "../config/db.js";
import Company from "../models/Company.js";
import User from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { verifyRefreshToken } from "../utils/token.js";
import { issueSession, clearRefreshCookie, safeEqual, refreshCookieName } from "../utils/authResponse.js";
import { profileOf, resolveAccount } from "../services/accounts.js";

const DB_UNAVAILABLE = "Database is not configured yet. Set MONGO_URI and restart the server.";

/** POST /api/auth/login — single entry point for super admin, admin, vendor, and customer. */
export const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        if (email === env.SUPER_ADMIN_EMAIL.toLowerCase()) {
            if (!safeEqual(password, env.SUPER_ADMIN_PASSWORD)) {
                return res.status(401).json({ error: "Invalid email or password." });
            }
            const accessToken = issueSession(res, { sub: "super_admin", role: "super_admin", company: null });
            return res.json({ accessToken, user: profileOf({ role: "super_admin" }) });
        }

        if (!isDbReady()) return res.status(503).json({ error: DB_UNAVAILABLE });

        const company = await Company.findOne({ email }).select("+passwordHash");
        if (company) {
            if (!(await comparePassword(password, company.passwordHash))) {
                return res.status(401).json({ error: "Invalid email or password." });
            }
            if (company.status !== "active") {
                return res.status(403).json({ error: "This company account has been suspended." });
            }
            const accessToken = issueSession(res, { sub: company._id.toString(), role: "admin", company: company._id.toString() });
            return res.json({ accessToken, user: profileOf({ role: "admin", doc: company }) });
        }

        /* An email is unique per company, not globally, so the same person can
           exist under two stores. Pick deterministically (oldest first) instead
           of relying on natural order, and only among usable accounts. */
        const candidates = await User.find({ email }).select("+passwordHash").sort({ createdAt: 1 });

        for (const user of candidates) {
            if (!(await comparePassword(password, user.passwordHash))) continue;

            if (user.status !== "active") {
                return res.status(403).json({ error: "This account has been suspended." });
            }
            const store = await Company.findById(user.company).select("status");
            if (!store || store.status !== "active") {
                return res.status(403).json({ error: "This store has been suspended." });
            }

            const accessToken = issueSession(res, {
                sub: user._id.toString(),
                role: user.role,
                company: user.company.toString()
            });
            return res.json({ accessToken, user: profileOf({ role: user.role, doc: user }) });
        }

        return res.status(401).json({ error: "Invalid email or password." });
    } catch (error) {
        next(error);
    }
};

/** POST /api/auth/register — public customer self-signup, scoped to a tenant/company. */
export const registerCustomer = async (req, res, next) => {
    if (!isDbReady()) return res.status(503).json({ error: DB_UNAVAILABLE });

    const { name, email, password, tenantSlug } = req.body;

    try {
        const company = await Company.findOne({ slug: tenantSlug, status: "active" });
        if (!company) return res.status(404).json({ error: "Store not found." });

        const passwordHash = await hashPassword(password);
        const user = await User.create({
            name,
            email,
            passwordHash,
            role: "customer",
            company: company._id,
            createdBy: "self"
        });

        const accessToken = issueSession(res, {
            sub: user._id.toString(),
            role: "customer",
            company: company._id.toString()
        });
        res.status(201).json({ accessToken, user: profileOf({ role: "customer", doc: user }) });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/refresh — reads the httpOnly cookie, reissues an access token.
 *
 * Re-reads the account every time: a stateless token alone would let a
 * suspended or deleted account keep refreshing for the cookie's full 30 days.
 */
export const refresh = async (req, res, next) => {
    const token = req.cookies?.[refreshCookieName];
    if (!token) return res.status(401).json({ error: "Not authenticated." });

    let decoded;
    try {
        decoded = verifyRefreshToken(token);
    } catch {
        clearRefreshCookie(res);
        return res.status(401).json({ error: "Session expired. Please log in again." });
    }

    try {
        if (decoded.role !== "super_admin" && !isDbReady()) {
            return res.status(503).json({ error: DB_UNAVAILABLE });
        }

        const account = await resolveAccount({ sub: decoded.sub, role: decoded.role });
        if (!account.ok) {
            clearRefreshCookie(res);
            return res.status(401).json({ error: account.reason });
        }

        const accessToken = issueSession(res, {
            sub: decoded.sub,
            role: account.profile.role,
            company: account.company
        });
        res.json({ accessToken, user: account.profile });
    } catch (error) {
        next(error);
    }
};

/** POST /api/auth/logout */
export const logout = (_req, res) => {
    clearRefreshCookie(res);
    res.json({ ok: true });
};

/** GET /api/auth/me — fresh profile for the currently authenticated account. */
export const me = async (req, res, next) => {
    try {
        if (req.auth.role !== "super_admin" && !isDbReady()) {
            return res.status(503).json({ error: DB_UNAVAILABLE });
        }

        const account = await resolveAccount(req.auth);
        if (!account.ok) return res.status(401).json({ error: account.reason });

        res.json({ user: account.profile });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/change-password — provisioned accounts are emailed a temporary
 * password, so they need a way to replace it. Super admin is env-backed and
 * cannot rotate its password here.
 */
export const changePassword = async (req, res, next) => {
    const { role, sub } = req.auth;

    if (role === "super_admin") {
        return res.status(400).json({ error: "Change SUPER_ADMIN_PASSWORD in the server environment instead." });
    }
    if (!isDbReady()) return res.status(503).json({ error: DB_UNAVAILABLE });

    const { currentPassword, newPassword } = req.body;

    try {
        const Model = role === "admin" ? Company : User;
        const account = await Model.findById(sub).select("+passwordHash");
        if (!account) return res.status(404).json({ error: "Account not found." });

        if (!(await comparePassword(currentPassword, account.passwordHash))) {
            return res.status(401).json({ error: "Your current password is incorrect." });
        }

        account.passwordHash = await hashPassword(newPassword);
        await account.save();

        /* Old refresh cookies stay valid until they expire — clearing this one
           at least forces a fresh login in the browser that changed it. */
        clearRefreshCookie(res);
        res.json({ ok: true });
    } catch (error) {
        next(error);
    }
};
