import User from "../models/User.js";

/** POST /api/customer/vendor-application — a logged-in customer applies to become a vendor. */
export const submitVendorApplication = async (req, res, next) => {
    try {
        const user = await User.findById(req.auth.sub);
        if (!user) return res.status(404).json({ error: "Account not found." });

        if (user.vendorApplication.status === "pending") {
            return res.status(409).json({ error: "You already have a pending application." });
        }
        if (user.vendorApplication.status === "approved") {
            return res.status(409).json({ error: "Your vendor application was already approved." });
        }

        const { businessName, note } = req.body;
        user.vendorApplication = {
            status: "pending",
            businessName,
            note: note ?? null,
            submittedAt: new Date(),
            decidedAt: null
        };
        await user.save();

        res.status(201).json({ vendorApplication: user.vendorApplication });
    } catch (error) {
        next(error);
    }
};

/** GET /api/customer/vendor-application — the caller's own application status. */
export const myVendorApplication = async (req, res, next) => {
    try {
        const user = await User.findById(req.auth.sub);
        if (!user) return res.status(404).json({ error: "Account not found." });
        res.json({ vendorApplication: user.vendorApplication });
    } catch (error) {
        next(error);
    }
};
