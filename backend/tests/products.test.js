import test, { before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";
process.env.GEMINI_API_KEY = "test-key-not-used-here";
process.env.JWT_ACCESS_SECRET = "a".repeat(48);
process.env.JWT_REFRESH_SECRET = "b".repeat(48);
process.env.SUPER_ADMIN_EMAIL = "super.dibyendu@yopmail.com";
process.env.SUPER_ADMIN_PASSWORD = "superdibyendu@123";

const { default: app } = await import("../app.js");
const { default: Company } = await import("../models/Company.js");
const { default: User } = await import("../models/User.js");
const { default: Product } = await import("../models/Product.js");

let mongod, server, base;

before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    server = app.listen(0);
    await new Promise(resolve => server.once("listening", resolve));
    base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    server?.close();
    await mongoose.disconnect();
    await mongod?.stop();
});

beforeEach(async () => {
    await Promise.all([Company.deleteMany({}), User.deleteMany({}), Product.deleteMany({})]);
});

async function call (method, path, { token, body } = {}) {
    const res = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
        method,
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
}

const loginAs = (email, password) => call("POST", "/api/auth/login", { body: { email, password } });

const SAMPLE_PRODUCT = {
    name: "Test Headphones",
    description: "Great sound.",
    brand: "TestBrand",
    category: "electronics",
    price: 1000,
    mrp: 2000,
    images: ["https://images.unsplash.com/photo-1"],
    tags: ["bestseller"]
};

/** Company + vendor fixture, ready to create products. */
async function seedVendor (companySlugSeed = "acme", vendorEmail = "vendor@acme.test") {
    const su = await loginAs("super.dibyendu@yopmail.com", "superdibyendu@123");
    const companyRes = await call("POST", "/api/super-admin/companies", {
        token: su.body.accessToken,
        body: { name: companySlugSeed, email: `admin@${companySlugSeed}.test`, password: "adminpass123" }
    });
    const admin = await loginAs(`admin@${companySlugSeed}.test`, "adminpass123");
    const vendorRes = await call("POST", "/api/admin/users", {
        token: admin.body.accessToken,
        body: { name: "Vee", email: vendorEmail, role: "vendor" }
    });
    return { company: companyRes.body.company, vendorUserId: vendorRes.body.user.id, adminToken: admin.body.accessToken };
}

/** Vendor accounts get a random temp password we can't guess, so fetch the hash
 *  directly and set a known one for tests that need to actually log in as vendor. */
async function seedVendorWithKnownPassword (companySlugSeed = "acme", vendorEmail = "vendor@acme.test") {
    const { company, vendorUserId, adminToken } = await seedVendor(companySlugSeed, vendorEmail);
    const { hashPassword } = await import("../utils/password.js");
    await User.findByIdAndUpdate(vendorUserId, { passwordHash: await hashPassword("vendorpass123") });
    const vendorLogin = await loginAs(vendorEmail, "vendorpass123");
    return { company, vendorToken: vendorLogin.body.accessToken, adminToken };
}

test("vendor can create, list, update and delete its own products", async () => {
    const { vendorToken } = await seedVendorWithKnownPassword();

    const created = await call("POST", "/api/vendor/products", { token: vendorToken, body: SAMPLE_PRODUCT });
    assert.equal(created.status, 201);
    const id = created.body.product.id;

    const list = await call("GET", "/api/vendor/products", { token: vendorToken });
    assert.equal(list.body.products.length, 1);

    const updated = await call("PATCH", `/api/vendor/products/${id}`, { token: vendorToken, body: { price: 1500 } });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.product.price, 1500);

    const removed = await call("DELETE", `/api/vendor/products/${id}`, { token: vendorToken });
    assert.equal(removed.status, 200);

    const listAfter = await call("GET", "/api/vendor/products", { token: vendorToken });
    assert.equal(listAfter.body.products.length, 0);
});

test("a vendor cannot see, edit, or delete another vendor's product", async () => {
    const a = await seedVendorWithKnownPassword("acme", "vendor@acme.test");
    const b = await seedVendorWithKnownPassword("globex", "vendor@globex.test");

    const created = await call("POST", "/api/vendor/products", { token: a.vendorToken, body: SAMPLE_PRODUCT });
    const id = created.body.product.id;

    assert.equal((await call("GET", `/api/vendor/products/${id}`, { token: b.vendorToken })).status, 404);
    assert.equal((await call("PATCH", `/api/vendor/products/${id}`, { token: b.vendorToken, body: { price: 1 } })).status, 404);
    assert.equal((await call("DELETE", `/api/vendor/products/${id}`, { token: b.vendorToken })).status, 404);

    // b's own list must stay empty — a's product must not leak across tenants.
    const listB = await call("GET", "/api/vendor/products", { token: b.vendorToken });
    assert.equal(listB.body.products.length, 0);
});

test("non-vendor roles cannot reach /api/vendor/products", async () => {
    const { adminToken } = await seedVendorWithKnownPassword();
    const su = await loginAs("super.dibyendu@yopmail.com", "superdibyendu@123");

    assert.equal((await call("GET", "/api/vendor/products", { token: adminToken })).status, 403);
    assert.equal((await call("GET", "/api/vendor/products", { token: su.body.accessToken })).status, 403);
    assert.equal((await call("GET", "/api/vendor/products")).status, 401);
});

test("public catalogue requires a tenant and only returns active products of active stores", async () => {
    const { company, vendorToken, adminToken } = await seedVendorWithKnownPassword();

    const created = await call("POST", "/api/vendor/products", { token: vendorToken, body: SAMPLE_PRODUCT });
    const id = created.body.product.id;

    // No tenant at all.
    assert.equal((await call("GET", "/api/products")).status, 400);

    // Visible while active.
    const visible = await call("GET", `/api/products?tenant=${company.slug}`);
    assert.equal(visible.status, 200);
    assert.equal(visible.body.products.length, 1);
    assert.equal((await call("GET", `/api/products/${id}`)).status, 200);

    // Vendor marks it inactive — gone from both list and detail.
    await call("PATCH", `/api/vendor/products/${id}`, { token: vendorToken, body: { status: "inactive" } });
    assert.equal((await call("GET", `/api/products?tenant=${company.slug}`)).body.products.length, 0);
    assert.equal((await call("GET", `/api/products/${id}`)).status, 404);

    // Reactivate, then suspend the whole company instead — must also disappear.
    await call("PATCH", `/api/vendor/products/${id}`, { token: vendorToken, body: { status: "active" } });
    const su = await loginAs("super.dibyendu@yopmail.com", "superdibyendu@123");
    await call("PATCH", `/api/super-admin/companies/${company.id}/status`, {
        token: su.body.accessToken,
        body: { status: "suspended" }
    });
    assert.equal((await call("GET", `/api/products?tenant=${company.slug}`)).status, 404);
    assert.equal((await call("GET", `/api/products/${id}`)).status, 404);
    void adminToken;
});

test("public catalogue filters by category, brand, tag, and price range", async () => {
    const { company, vendorToken } = await seedVendorWithKnownPassword();

    await call("POST", "/api/vendor/products", { token: vendorToken, body: { ...SAMPLE_PRODUCT, name: "Cheap Phone", category: "mobiles", brand: "Nexa", price: 5000, mrp: 6000, tags: ["deal"] } });
    await call("POST", "/api/vendor/products", { token: vendorToken, body: { ...SAMPLE_PRODUCT, name: "Costly Laptop", category: "electronics", brand: "Stellar", price: 90000, mrp: 100000, tags: ["premium"] } });

    const byCategory = await call("GET", `/api/products?tenant=${company.slug}&category=mobiles`);
    assert.equal(byCategory.body.products.length, 1);
    assert.equal(byCategory.body.products[0].name, "Cheap Phone");

    const byBrand = await call("GET", `/api/products?tenant=${company.slug}&brand=Stellar`);
    assert.equal(byBrand.body.products.length, 1);

    const byTag = await call("GET", `/api/products?tenant=${company.slug}&tag=deal`);
    assert.equal(byTag.body.products.length, 1);

    const byPrice = await call("GET", `/api/products?tenant=${company.slug}&minPrice=10000`);
    assert.equal(byPrice.body.products.length, 1);
    assert.equal(byPrice.body.products[0].name, "Costly Laptop");
});

test("public catalogue paginates and rejects a limit above the ceiling", async () => {
    const { company, vendorToken } = await seedVendorWithKnownPassword();
    for (let i = 0; i < 3; i++) {
        await call("POST", "/api/vendor/products", { token: vendorToken, body: { ...SAMPLE_PRODUCT, name: `Item ${i}` } });
    }

    const page1 = await call("GET", `/api/products?tenant=${company.slug}&limit=2&page=1`);
    assert.equal(page1.body.products.length, 2);
    assert.equal(page1.body.total, 3);

    const page2 = await call("GET", `/api/products?tenant=${company.slug}&limit=2&page=2`);
    assert.equal(page2.body.products.length, 1);

    assert.equal((await call("GET", `/api/products?tenant=${company.slug}&limit=99999`)).status, 400);
});

test("malformed product id returns 400, not a 500", async () => {
    const { vendorToken } = await seedVendorWithKnownPassword();
    assert.equal((await call("GET", "/api/vendor/products/not-an-id", { token: vendorToken })).status, 400);
    assert.equal((await call("GET", "/api/products/not-an-id")).status, 400);
});

test("creating a product validates mrp against price and requires an image", async () => {
    const { vendorToken } = await seedVendorWithKnownPassword();

    const badMrp = await call("POST", "/api/vendor/products", {
        token: vendorToken,
        body: { ...SAMPLE_PRODUCT, price: 2000, mrp: 1000 }
    });
    assert.equal(badMrp.status, 400);

    const noImage = await call("POST", "/api/vendor/products", {
        token: vendorToken,
        body: { ...SAMPLE_PRODUCT, images: [] }
    });
    assert.equal(noImage.status, 400);
});

test("two vendors in the same company can each use the same product name (slug isn't globally forced)", async () => {
    const su = await loginAs("super.dibyendu@yopmail.com", "superdibyendu@123");
    const companyRes = await call("POST", "/api/super-admin/companies", {
        token: su.body.accessToken,
        body: { name: "SharedCo", email: "admin@shared.test", password: "adminpass123" }
    });
    const admin = await loginAs("admin@shared.test", "adminpass123");

    const v1 = await call("POST", "/api/admin/users", { token: admin.body.accessToken, body: { name: "V1", email: "v1@shared.test", role: "vendor" } });
    const v2 = await call("POST", "/api/admin/users", { token: admin.body.accessToken, body: { name: "V2", email: "v2@shared.test", role: "vendor" } });
    const { hashPassword } = await import("../utils/password.js");
    await User.findByIdAndUpdate(v1.body.user.id, { passwordHash: await hashPassword("pass12345") });
    await User.findByIdAndUpdate(v2.body.user.id, { passwordHash: await hashPassword("pass12345") });

    const t1 = (await loginAs("v1@shared.test", "pass12345")).body.accessToken;
    const t2 = (await loginAs("v2@shared.test", "pass12345")).body.accessToken;

    const p1 = await call("POST", "/api/vendor/products", { token: t1, body: SAMPLE_PRODUCT });
    const p2 = await call("POST", "/api/vendor/products", { token: t2, body: SAMPLE_PRODUCT });
    assert.equal(p1.status, 201);
    assert.equal(p2.status, 201);
    assert.notEqual(p1.body.product.id, p2.body.product.id);

    const publicList = await call("GET", `/api/products?tenant=${companyRes.body.company.slug}`);
    assert.equal(publicList.body.products.length, 2, "both vendors' products must be visible in the shared storefront");
});
