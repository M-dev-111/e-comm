import mongoose from "mongoose";

/**
 * A catalogue item. Scoped to a company and owned by the vendor (or admin)
 * who created it. Customers of that company see only its `active` products.
 */
const productSchema = new mongoose.Schema(
    {
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },
        // Who added it — a vendor or an admin of the same company.
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        name: { type: String, required: true, trim: true },
        description: { type: String, default: "", trim: true },
        brand: { type: String, default: "", trim: true },
        category: { type: String, default: "general", trim: true, lowercase: true },
        price: { type: Number, required: true, min: 0 },
        mrp: { type: Number, min: 0 },
        stock: { type: Number, default: 0, min: 0 },
        image: { type: String, default: "" },
        status: { type: String, enum: ["active", "draft", "archived"], default: "active" }
    },
    { timestamps: true }
);

productSchema.index({ company: 1, status: 1 });

export default mongoose.model("Product", productSchema);
