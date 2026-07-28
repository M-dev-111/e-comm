import { asyncHandler } from "../utils/asyncHandler.js";
import { presentUser } from "../utils/present.js";
import Company from "../models/Company.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const fail = (status, error) => Object.assign(new Error(error), { status });

const presentCompany = (c, counts) => ({
    id: String(c._id),
    name: c.name,
    slug: c.slug,
    email: c.email || "",
    phone: c.phone || "",
    plan: c.plan,
    status: c.status,
    createdAt: c.createdAt,
    ...(counts ? { counts } : {})
});

/** POST /api/companies — create a tenant and its first admin together. */
export const createCompany = asyncHandler(async (req, res) => {
    const { name, slug, email, phone, plan, adminName, adminEmail, adminPassword } = req.body;

    const company = await Company.create({ name, slug, email, phone, plan });

    // No cross-document transaction (the in-memory dev DB is standalone), so if
    // the admin can't be created we roll the company back by hand.
    let admin;
    try {
        admin = await User.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: "admin",
            company: company._id
        });
    } catch (err) {
        await Company.findByIdAndDelete(company._id);
        throw err;
    }
    await admin.populate("company", "name slug");

    res.status(201).json({ company: presentCompany(company), admin: presentUser(admin) });
});

/** GET /api/companies — every tenant, with headline counts. */
export const listCompanies = asyncHandler(async (req, res) => {
    const companies = await Company.find().sort({ createdAt: -1 });

    const [users, products, orders] = await Promise.all([
        User.aggregate([{ $match: { company: { $ne: null } } }, { $group: { _id: "$company", n: { $sum: 1 } } }]),
        Product.aggregate([{ $group: { _id: "$company", n: { $sum: 1 } } }]),
        Order.aggregate([{ $group: { _id: "$company", n: { $sum: 1 }, revenue: { $sum: "$total" } } }])
    ]);

    const byId = (arr, key = "n") => Object.fromEntries(arr.map(x => [String(x._id), x[key]]));
    const uMap = byId(users), pMap = byId(products), oMap = byId(orders), rMap = byId(orders, "revenue");

    res.json({
        companies: companies.map(c =>
            presentCompany(c, {
                users: uMap[String(c._id)] || 0,
                products: pMap[String(c._id)] || 0,
                orders: oMap[String(c._id)] || 0,
                revenue: rMap[String(c._id)] || 0
            })
        )
    });
});

/** GET /api/companies/:id */
export const getCompany = asyncHandler(async (req, res) => {
    const company = await Company.findById(req.params.id);
    if (!company) throw fail(404, "Company not found.");

    const [users, products, orders] = await Promise.all([
        User.countDocuments({ company: company._id }),
        Product.countDocuments({ company: company._id }),
        Order.countDocuments({ company: company._id })
    ]);

    res.json({ company: presentCompany(company, { users, products, orders }) });
});

/** PATCH /api/companies/:id */
export const updateCompany = asyncHandler(async (req, res) => {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!company) throw fail(404, "Company not found.");
    res.json({ company: presentCompany(company) });
});

/** DELETE /api/companies/:id — removes the tenant and all of its data. */
export const deleteCompany = asyncHandler(async (req, res) => {
    const company = await Company.findById(req.params.id);
    if (!company) throw fail(404, "Company not found.");

    await Promise.all([
        User.deleteMany({ company: company._id }),
        Product.deleteMany({ company: company._id }),
        Order.deleteMany({ company: company._id })
    ]);
    await company.deleteOne();

    res.json({ ok: true, message: "Company and all its data were deleted." });
});
