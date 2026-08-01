import { env } from "../config/env.js";
import Company from "../models/Company.js";
import User from "../models/User.js";

/**
 * The three account shapes collapsed into one client-facing profile:
 *   super_admin — static, env-backed, no DB row
 *   admin       — IS the Company document
 *   vendor/customer — a User document
 */
export function profileOf ({ role, doc }) {
    if (role === "super_admin") {
        return { id: "super_admin", role, name: "Super Admin", email: env.SUPER_ADMIN_EMAIL, company: null };
    }
    if (role === "admin") {
        return { id: doc._id, role, name: doc.name, email: doc.email, logo: doc.logo, company: doc._id };
    }
    return { id: doc._id, role, name: doc.name, email: doc.email, company: doc.company };
}

/**
 * Resolves the live account behind a token and asserts it may still be used.
 *
 * Tokens are stateless, so without this a suspended or deleted account keeps
 * minting fresh access tokens from its 30-day refresh cookie. Every refresh
 * goes through here so a suspension takes effect within one access-token TTL.
 *
 * @returns {{ ok: true, profile, company }} | {{ ok: false, reason: string }}
 */
export async function resolveAccount ({ sub, role }) {
    if (role === "super_admin") {
        return { ok: true, profile: profileOf({ role: "super_admin" }), company: null };
    }

    if (role === "admin") {
        const company = await Company.findById(sub);
        if (!company) return { ok: false, reason: "Account not found." };
        if (company.status !== "active") return { ok: false, reason: "This company account has been suspended." };
        return { ok: true, profile: profileOf({ role: "admin", doc: company }), company: company._id.toString() };
    }

    const user = await User.findById(sub);
    if (!user) return { ok: false, reason: "Account not found." };
    if (user.status !== "active") return { ok: false, reason: "This account has been suspended." };

    // A user of a suspended company must lose access too, not just the admin.
    const company = await Company.findById(user.company).select("status");
    if (!company || company.status !== "active") {
        return { ok: false, reason: "This store has been suspended." };
    }

    /* role travels in the token, but an approved vendor application changes it.
       Trust the database, so an upgraded customer isn't stuck on a stale role. */
    return { ok: true, profile: profileOf({ role: user.role, doc: user }), company: user.company.toString() };
}

/**
 * Approve or reject a pending vendor application.
 * `scope` narrows the lookup to one company for admins; super admins pass {}.
 */
export async function decideVendorApplication ({ userId, decision, scope = {} }) {
    const user = await User.findOne({ ...scope, _id: userId, "vendorApplication.status": "pending" });
    if (!user) return null;

    user.vendorApplication.status = decision;
    user.vendorApplication.decidedAt = new Date();
    if (decision === "approved") user.role = "vendor";
    await user.save();

    return user;
}

/** Shared list pagination — capped so an unbounded scan can't be requested. */
export function paginate (query) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 50;
    return { skip: (page - 1) * limit, limit, page };
}
