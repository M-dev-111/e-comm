import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const ROLES = ["superadmin", "admin", "vendor", "customer"];

/**
 * Every account in the system.
 *
 * - superadmin: platform owner. company is null; sees across all tenants.
 * - admin:      owns one company. Manages its vendors, customers, products.
 * - vendor:     belongs to one company. Manages their own products.
 * - customer:   belongs to one company. Browses and buys.
 *
 * Email is unique per company (not globally), so the same person can be a
 * customer of two different stores — enforced by the compound index below.
 */
const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        // select:false → password hash never leaves the DB layer by accident.
        password: { type: String, required: true, select: false },
        role: { type: String, enum: ROLES, required: true },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            default: null,
            index: true
        },
        status: { type: String, enum: ["active", "disabled"], default: "active" }
    },
    { timestamps: true }
);

// Same email may exist once per company (and once among superadmins where company is null).
userSchema.index({ company: 1, email: 1 }, { unique: true });

// Mongoose 9 async hooks resolve on return — no `next` callback.
userSchema.pre("save", async function hashPassword () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword (candidate) {
    return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
