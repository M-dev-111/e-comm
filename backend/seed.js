import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import Company from "./models/Company.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";

/* Demo data. Two companies exist so tenant isolation is visible immediately:
   an Aurora vendor must never see Nova's products or orders. */

const PASSWORD = "password123";

const PRODUCTS = {
    aurora: [
        { name: "Aurora Wireless Earbuds", brand: "Aurora Audio", category: "electronics", price: 2499, mrp: 3999, stock: 40, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=70" },
        { name: "Aurora Smart Watch 2", brand: "Aurora Audio", category: "electronics", price: 4999, mrp: 6999, stock: 25, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=70" },
        { name: "Trail Runner Shoes", brand: "StridePro", category: "footwear", price: 3299, mrp: 4500, stock: 60, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=70" },
        { name: "Everyday Canvas Sneakers", brand: "StridePro", category: "footwear", price: 1799, mrp: 2499, stock: 5, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=70" }
    ],
    nova: [
        { name: "Nova Ceramic Planter", brand: "NovaHome", category: "home", price: 899, mrp: 1299, stock: 80, image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=70" },
        { name: "Nova Desk Lamp", brand: "NovaHome", category: "home", price: 1599, mrp: 2200, stock: 30, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=70" }
    ]
};

async function ensureSuperAdmin () {
    const existing = await User.findOne({ role: "superadmin" });
    if (existing) return existing;
    return User.create({
        name: "Platform Owner",
        email: env.SUPERADMIN_EMAIL,
        password: env.SUPERADMIN_PASSWORD,
        role: "superadmin",
        company: null
    });
}

async function seedCompany ({ name, slug, plan }, vendorNames, customerNames, products) {
    const company = await Company.create({ name, slug, plan, email: `hello@${slug}.com` });

    const admin = await User.create({
        name: `${name} Admin`, email: `admin@${slug}.com`, password: PASSWORD, role: "admin", company: company._id
    });
    const vendors = await User.create(
        vendorNames.map((vn, i) => ({ name: vn, email: `vendor${i + 1}@${slug}.com`, password: PASSWORD, role: "vendor", company: company._id }))
    );
    const customers = await User.create(
        customerNames.map((cn, i) => ({ name: cn, email: `customer${i + 1}@${slug}.com`, password: PASSWORD, role: "customer", company: company._id }))
    );

    // Round-robin products across the company's vendors.
    const created = await Product.create(
        products.map((p, i) => ({ ...p, company: company._id, vendor: vendors[i % vendors.length]._id }))
    );

    return { company, admin, vendors, customers, products: created };
}

export async function seed () {
    await ensureSuperAdmin();

    if (await Company.findOne({ slug: "aurora" })) {
        return { skipped: true };
    }

    const aurora = await seedCompany(
        { name: "Aurora Store", slug: "aurora", plan: "pro" },
        ["Ravi Kumar", "Meera Nair"],
        ["Asha Customer", "Dev Customer"],
        PRODUCTS.aurora
    );
    const nova = await seedCompany(
        { name: "Nova Mart", slug: "nova", plan: "basic" },
        ["Sara Nova"],
        ["Nikhil Customer"],
        PRODUCTS.nova
    );

    // One sample order so dashboards are not empty on first load.
    const p = aurora.products;
    const items = [
        { product: p[0]._id, vendor: p[0].vendor, name: p[0].name, price: p[0].price, qty: 1 },
        { product: p[2]._id, vendor: p[2].vendor, name: p[2].name, price: p[2].price, qty: 2 }
    ];
    await Order.create({
        company: aurora.company._id,
        customer: aurora.customers[0]._id,
        items,
        total: items.reduce((s, i) => s + i.price * i.qty, 0),
        vendors: [...new Set(items.map(i => String(i.vendor)))],
        status: "paid"
    });

    return { skipped: false, companies: [aurora.company.slug, nova.company.slug] };
}

/** Printable summary of the demo logins. */
export function credentialsBanner () {
    return [
        "",
        "  Demo accounts (all non-super passwords: password123)",
        "  ────────────────────────────────────────────────────",
        `  SUPER ADMIN  ${env.SUPERADMIN_EMAIL}  /  ${env.SUPERADMIN_PASSWORD}`,
        "  AURORA admin@aurora.com · vendor1@aurora.com · customer1@aurora.com",
        "  NOVA   admin@nova.com   · vendor1@nova.com   · customer1@nova.com",
        "  Customer store slugs: 'aurora', 'nova'",
        ""
    ].join("\n");
}

// Allow `node seed.js` to (re)seed a real database from the CLI.
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("seed.js")) {
    (async () => {
        await connectDB();
        const result = await seed();
        console.log(result.skipped ? "Already seeded — nothing to do." : `Seeded: ${result.companies.join(", ")}`);
        console.log(credentialsBanner());
        await disconnectDB();
        process.exit(0);
    })();
}
