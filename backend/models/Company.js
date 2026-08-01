import mongoose from "mongoose";

/* A Company doc IS the admin account (per product spec: "admin === company").
   Its email/password are what the admin logs in with directly — there is no
   separate admin User row. */
const companySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true, unique: true },
        passwordHash: { type: String, required: true, select: false },
        logo: { type: String, default: null },
        slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
        status: { type: String, enum: ["active", "suspended"], default: "active" }
    },
    { timestamps: true }
);

export default mongoose.model("Company", companySchema);
