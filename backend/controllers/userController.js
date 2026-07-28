import { asyncHandler } from "../utils/asyncHandler.js";
import { presentUser } from "../utils/present.js";
import { tenantFilter } from "../middleware/rbac.js";
import User from "../models/User.js";

const fail = (status, error) => Object.assign(new Error(error), { status });

/**
 * POST /api/users
 * - super admin → may create an "admin" for a given company.
 * - admin       → may create "vendor" or "customer" inside their own company.
 */
export const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, company } = req.body;
    const actor = req.user;

    let companyId;
    if (actor.role === "superadmin") {
        if (role !== "admin") throw fail(403, "A super admin can only create admins here.");
        if (!company) throw fail(400, "A company id is required when creating an admin.");
        companyId = company;
    } else {
        // actor is an admin (enforced by requireRole on the route)
        if (!["vendor", "customer"].includes(role)) {
            throw fail(403, "An admin can only create vendors or customers.");
        }
        companyId = actor.company._id;
    }

    const user = await User.create({ name, email, password, role, company: companyId });
    await user.populate("company", "name slug");
    res.status(201).json({ user: presentUser(user) });
});

/** GET /api/users?role=vendor — scoped to the caller's tenant. */
export const listUsers = asyncHandler(async (req, res) => {
    const filter = tenantFilter(req);
    if (req.query.role) filter.role = req.query.role;
    // Admins never manage the super admin, and it is noise in a tenant list.
    if (req.user.role !== "superadmin") filter.role = filter.role || { $ne: "superadmin" };

    const users = await User.find(filter).populate("company", "name slug").sort({ createdAt: -1 });
    res.json({ users: users.map(presentUser) });
});

/** GET /api/users/:id */
export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.params.id, ...tenantFilter(req) }).populate("company", "name slug");
    if (!user) throw fail(404, "User not found.");
    res.json({ user: presentUser(user) });
});

/** PATCH /api/users/:id — name, password, or enable/disable. */
export const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.params.id, ...tenantFilter(req) });
    if (!user) throw fail(404, "User not found.");
    if (String(user._id) === String(req.user._id) && req.body.status === "disabled") {
        throw fail(400, "You cannot disable your own account.");
    }
    if (user.role === "superadmin" && req.user.role !== "superadmin") {
        throw fail(403, "You cannot modify this account.");
    }

    Object.assign(user, req.body); // password re-hashes via the pre-save hook
    await user.save();
    await user.populate("company", "name slug");
    res.json({ user: presentUser(user) });
});

/** DELETE /api/users/:id */
export const deleteUser = asyncHandler(async (req, res) => {
    if (String(req.params.id) === String(req.user._id)) {
        throw fail(400, "You cannot delete your own account.");
    }
    const user = await User.findOne({ _id: req.params.id, ...tenantFilter(req) });
    if (!user) throw fail(404, "User not found.");
    if (user.role === "superadmin") throw fail(403, "The super admin cannot be deleted.");

    await user.deleteOne();
    res.json({ ok: true, message: "User deleted." });
});
