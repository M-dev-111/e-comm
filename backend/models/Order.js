import mongoose from "mongoose";

/* Line items snapshot the product's name/price at purchase time, so later
   edits to the catalogue never rewrite order history. `vendor` is copied onto
   each line so a vendor can be shown just the lines that are theirs. */
const orderItemSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        qty: { type: Number, required: true, min: 1 }
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        items: {
            type: [orderItemSchema],
            validate: [items => items.length > 0, "An order needs at least one item."]
        },
        total: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
            default: "pending"
        },
        // Distinct vendor ids across the items — lets us query "orders that
        // involve this vendor" without unwinding the items array every time.
        vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }]
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
