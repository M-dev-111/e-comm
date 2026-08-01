import Company from "../models/Company.js";
import User from "../models/User.js";
import { createCompanyWithAdmin, createProvisionedUser } from "../services/provisioning.js";
import { decideVendorApplication as decideApplication, paginate } from "../services/accounts.js";

/** POST /api/super-admin/companies */
export const createCompany = async (req, res, next) => {
    try {
        const { company, emailDelivered } = await createCompanyWithAdmin(req.body);
        res.status(201).json({
            company: { id: company._id, name: company.name, email: company.email, slug: company.slug, logo: company.logo, status: company.status },
            emailDelivered
        });
    } catch (error) {
        next(error);
    }
};

/** GET /api/super-admin/companies */
export const listCompanies = async (req, res, next) => {
    const { skip, limit, page } = paginate(req.validatedQuery);

    try {
        const [companies, total] = await Promise.all([
            Company.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Company.estimatedDocumentCount()
        ]);
        res.json({ companies, total, page, limit });
    } catch (error) {
        next(error);
    }
};

/** PATCH /api/super-admin/companies/:id/status */
export const updateCompanyStatus = async (req, res, next) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!company) return res.status(404).json({ error: "Company not found." });
        res.json({ company });
    } catch (error) {
        next(error);
    }
};

/** POST /api/super-admin/users — create a vendor/customer under any company. */
export const createUser = async (req, res, next) => {
    const { name, email, role, companyId } = req.body;
    if (!companyId) return res.status(400).json({ error: "companyId is required." });

    try {
        const company = await Company.findById(companyId);
        if (!company) return res.status(404).json({ error: "Company not found." });

        const { user, emailDelivered } = await createProvisionedUser({ name, email, role, companyId, createdBy: "super_admin" });
        res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, company: user.company }, emailDelivered });
    } catch (error) {
        next(error);
    }
};

/** GET /api/super-admin/users?companyId=&role=&page=&limit= */
export const listUsers = async (req, res, next) => {
    const query = req.validatedQuery ?? {};
    const { skip, limit, page } = paginate(query);

    const filter = {};
    if (query.companyId) filter.company = query.companyId;
    if (query.role) filter.role = query.role;

    try {
        const [users, total] = await Promise.all([
            User.find(filter).populate("company", "name slug").sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(filter)
        ]);
        res.json({ users, total, page, limit });
    } catch (error) {
        next(error);
    }
};

/** GET /api/super-admin/vendor-applications?companyId= */
export const listVendorApplications = async (req, res, next) => {
    const query = req.validatedQuery ?? {};
    const { skip, limit, page } = paginate(query);

    const filter = { "vendorApplication.status": "pending" };
    if (query.companyId) filter.company = query.companyId;

    try {
        const [applications, total] = await Promise.all([
            User.find(filter).populate("company", "name slug").sort({ "vendorApplication.submittedAt": 1 }).skip(skip).limit(limit),
            User.countDocuments(filter)
        ]);
        res.json({ applications, total, page, limit });
    } catch (error) {
        next(error);
    }
};

/** PATCH /api/super-admin/vendor-applications/:userId — platform-wide, no company scope. */
export const decideVendorApplication = async (req, res, next) => {
    try {
        const user = await decideApplication({ userId: req.params.userId, decision: req.body.decision });
        if (!user) return res.status(404).json({ error: "No pending application found." });
        res.json({ user });
    } catch (error) {
        next(error);
    }
};
