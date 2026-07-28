import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/token.js";
import { presentUser } from "../utils/present.js";
import User from "../models/User.js";
import Company from "../models/Company.js";

const fail = (status, error) => Object.assign(new Error(error), { status });

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
    const { email, password, companySlug } = req.body;

    const query = { email };
    if (companySlug) {
        const company = await Company.findOne({ slug: companySlug });
        if (!company) throw fail(404, "No store found with that address.");
        query.company = company._id;
    }

    // Email is unique per company, so without a slug there may be several.
    const matches = await User.find(query).select("+password").populate("company", "name slug status plan");

    if (matches.length === 0) throw fail(401, "Invalid email or password.");
    if (matches.length > 1) {
        throw fail(409, "This email exists on more than one store. Please include your store address.");
    }

    const user = matches[0];
    if (!(await user.comparePassword(password))) throw fail(401, "Invalid email or password.");
    if (user.status === "disabled") throw fail(403, "This account has been disabled.");
    if (user.role !== "superadmin" && user.company?.status === "suspended") {
        throw fail(403, "This store is currently suspended.");
    }

    res.json({ token: signToken(user), user: presentUser(user) });
});

/** POST /api/auth/register — public customer sign-up into an existing store. */
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, companySlug } = req.body;

    const company = await Company.findOne({ slug: companySlug });
    if (!company) throw fail(404, "No store found with that address.");
    if (company.status === "suspended") throw fail(403, "This store is not accepting sign-ups right now.");

    const user = await User.create({ name, email, password, role: "customer", company: company._id });
    await user.populate("company", "name slug status plan");

    res.status(201).json({ token: signToken(user), user: presentUser(user) });
});

/** GET /api/auth/me */
export const me = asyncHandler(async (req, res) => {
    res.json({ user: presentUser(req.user) });
});
