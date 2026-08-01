import User from "../models/User.js";
import { createProvisionedUser } from "../services/provisioning.js";
import { decideVendorApplication as decideApplication, paginate } from "../services/accounts.js";

/** POST /api/admin/users — create a vendor/customer under the admin's own company. */
export const createUser = async (req, res, next) => {
    const { name, email, role } = req.body;
    const companyId = req.auth.company;

    try {
        const { user, emailDelivered } = await createProvisionedUser({ name, email, role, companyId, createdBy: "admin" });
        res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, emailDelivered });
    } catch (error) {
        next(error);
    }
};

/** GET /api/admin/users?role=&page=&limit= — scoped to the caller's company. */
export const listUsers = async (req, res, next) => {
    const query = req.validatedQuery ?? {};
    const { skip, limit, page } = paginate(query);

    const filter = { company: req.auth.company };
    if (query.role) filter.role = query.role;

    try {
        const [users, total] = await Promise.all([
            User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(filter)
        ]);
        res.json({ users, total, page, limit });
    } catch (error) {
        next(error);
    }
};

/** PATCH /api/admin/users/:id/status */
export const updateUserStatus = async (req, res, next) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.params.id, company: req.auth.company },
            { status: req.body.status },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: "User not found." });
        res.json({ user });
    } catch (error) {
        next(error);
    }
};

/** GET /api/admin/vendor-applications — pending applications for this company only. */
export const listVendorApplications = async (req, res, next) => {
    const { skip, limit, page } = paginate(req.validatedQuery);
    const filter = { company: req.auth.company, "vendorApplication.status": "pending" };

    try {
        const [applications, total] = await Promise.all([
            User.find(filter).sort({ "vendorApplication.submittedAt": 1 }).skip(skip).limit(limit),
            User.countDocuments(filter)
        ]);
        res.json({ applications, total, page, limit });
    } catch (error) {
        next(error);
    }
};

/** PATCH /api/admin/vendor-applications/:userId — scoped so one admin can't decide another's. */
export const decideVendorApplication = async (req, res, next) => {
    try {
        const user = await decideApplication({
            userId: req.params.userId,
            decision: req.body.decision,
            scope: { company: req.auth.company }
        });
        if (!user) return res.status(404).json({ error: "No pending application found." });
        res.json({ user });
    } catch (error) {
        next(error);
    }
};
