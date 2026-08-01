import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, trim: true, lowercase: true },
        description: { type: String, required: true, trim: true },
        brand: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true, lowercase: true, index: true },
        tags: { type: [String], default: [] },

        price: { type: Number, required: true, min: 0 },
        mrp: { type: Number, required: true, min: 0 },
        stock: { type: Number, required: true, min: 0, default: 0 },
        deliveryDays: { type: Number, min: 0, default: 3 },

        images: {
            type: [String],
            required: true,
            validate: { validator: v => Array.isArray(v) && v.length > 0, message: "At least one image is required." }
        },
        colors: { type: [String], default: undefined },
        sizes: { type: [String], default: undefined },
        highlights: { type: [String], default: [] },
        // Free-form key/value spec sheet (e.g. { Display: '6.7" AMOLED' }) — shape varies too much per category for a fixed schema.
        specs: { type: Map, of: String, default: {} },

        // Demo/display stats only — no review system exists yet, so these never change post-creation.
        rating: { type: Number, min: 0, max: 5, default: 0 },
        ratingCount: { type: Number, min: 0, default: 0 },
        reviewCount: { type: Number, min: 0, default: 0 },
        assured: { type: Boolean, default: false },

        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        status: { type: String, enum: ["active", "inactive"], default: "active" }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret) => {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
                return ret;
            }
        }
    }
);

productSchema.index({ company: 1, slug: 1 }, { unique: true });
productSchema.index({ company: 1, status: 1, category: 1 });
productSchema.index({ name: "text", description: "text" });

export default mongoose.model("Product", productSchema);
