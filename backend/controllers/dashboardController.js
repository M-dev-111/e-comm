import { asyncHandler } from "../utils/asyncHandler.js";
import Company from "../models/Company.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const revenueOf = async match => {
    const [row] = await Order.aggregate([
        { $match: { ...match, status: { $ne: "cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$total" } } }
    ]);
    return row?.revenue || 0;
};

/** GET /api/dashboard/stats — a different shape per role. */
export const stats = asyncHandler(async (req, res) => {
    const { role } = req.user;
    const companyId = req.companyId;

    if (role === "superadmin") {
        const [companies, users, products, orders, revenue, recentCompanies] = await Promise.all([
            Company.countDocuments(),
            User.countDocuments({ role: { $ne: "superadmin" } }),
            Product.countDocuments(),
            Order.countDocuments(),
            revenueOf({}),
            Company.find().sort({ createdAt: -1 }).limit(5)
        ]);
        return res.json({
            role,
            cards: { companies, users, products, orders, revenue },
            recentCompanies: recentCompanies.map(c => ({
                id: String(c._id), name: c.name, slug: c.slug, plan: c.plan, status: c.status
            }))
        });
    }

    if (role === "admin") {
        const [vendors, customers, products, orders, revenue, recentOrders] = await Promise.all([
            User.countDocuments({ company: companyId, role: "vendor" }),
            User.countDocuments({ company: companyId, role: "customer" }),
            Product.countDocuments({ company: companyId }),
            Order.countDocuments({ company: companyId }),
            revenueOf({ company: req.user.company._id }),
            Order.find({ company: companyId }).populate("customer", "name").sort({ createdAt: -1 }).limit(5)
        ]);
        return res.json({
            role,
            cards: { vendors, customers, products, orders, revenue },
            recentOrders: recentOrders.map(o => ({
                id: String(o._id), customer: o.customer?.name || "—", total: o.total, status: o.status, createdAt: o.createdAt
            }))
        });
    }

    if (role === "vendor") {
        const products = await Product.find({ company: companyId, vendor: req.user._id });
        const lowStock = products.filter(p => p.stock <= 5).length;
        const orders = await Order.find({ company: companyId, vendors: req.user._id });
        // Sum only this vendor's lines across orders (excluding cancelled).
        let revenue = 0, units = 0;
        for (const o of orders) {
            if (o.status === "cancelled") continue;
            for (const i of o.items) {
                if (String(i.vendor) === String(req.user._id)) { revenue += i.price * i.qty; units += i.qty; }
            }
        }
        return res.json({
            role,
            cards: { products: products.length, lowStock, orders: orders.length, unitsSold: units, revenue }
        });
    }

    // customer
    const myOrders = await Order.find({ company: companyId, customer: req.user._id });
    const spent = myOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
    return res.json({
        role,
        cards: { orders: myOrders.length, spent }
    });
});
