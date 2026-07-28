import mongoose from "mongoose";

/**
 * A tenant. Everything else (users, products, orders) belongs to exactly one
 * company, and no query ever crosses the company boundary except for the
 * super admin. The `slug` is the tenant's public handle — customers register
 * against it, so it is unique platform-wide.
 */
const companySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[a-z0-9-]+$/, "Slug may contain only lowercase letters, numbers and hyphens."]
        },
        email: { type: String, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        plan: { type: String, enum: ["trial", "basic", "pro"], default: "trial" },
        status: { type: String, enum: ["active", "suspended"], default: "active" }
    },
    { timestamps: true }
);

export default mongoose.model("Company", companySchema);
