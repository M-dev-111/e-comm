import mongoose from "mongoose";

/* Vendor and customer accounts. Super admin is not a DB row (static, env-based
   credentials in config/env.js) and admin is the Company doc itself — this
   model only ever holds role "vendor" or "customer". */
const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        /* Indexed on its own as well as in the compound index below: login looks
           an account up by email alone, and {company,email} can't serve that
           query (email isn't the prefix), which would mean a collection scan. */
        email: { type: String, required: true, trim: true, lowercase: true, index: true },
        passwordHash: { type: String, required: true, select: false },
        role: { type: String, enum: ["vendor", "customer"], required: true },
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
        status: { type: String, enum: ["active", "suspended"], default: "active" },

        // Who provisioned this account — vendors are always provisioned, customers can self-register.
        createdBy: { type: String, enum: ["super_admin", "admin", "self"], required: true },

        // Customer -> vendor upgrade path. Only meaningful while role is "customer"
        // (approving flips role to "vendor" and leaves this as a historical record).
        vendorApplication: {
            status: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
            businessName: { type: String, default: null },
            note: { type: String, default: null },
            submittedAt: { type: Date, default: null },
            decidedAt: { type: Date, default: null }
        }
    },
    { timestamps: true }
);

// Same email may legitimately exist under two different companies (two tenants); not globally.
userSchema.index({ company: 1, email: 1 }, { unique: true });

// Both portals poll for pending applications; without this that's a full scan.
userSchema.index({ "vendorApplication.status": 1, company: 1 });

export default mongoose.model("User", userSchema);
