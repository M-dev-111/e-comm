import test, { before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

/* env is validated at import time, so these must be set before app.js loads. */
process.env.NODE_ENV = "test";
process.env.GEMINI_API_KEY = "test-key-not-used-here";
process.env.JWT_ACCESS_SECRET = "a".repeat(48);
process.env.JWT_REFRESH_SECRET = "b".repeat(48);
process.env.SUPER_ADMIN_EMAIL = "super.dibyendu@yopmail.com";
process.env.SUPER_ADMIN_PASSWORD = "superdibyendu@123";

const { default: app } = await import("../app.js");
const { default: Company } = await import("../models/Company.js");
const { default: User } = await import("../models/User.js");

const SUPER = { email: "super.dibyendu@yopmail.com", password: "superdibyendu@123" };

let mongod;
let server;
let base;

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
    await Promise.all([Company.deleteMany({}), User.deleteMany({})]);
});

/** Minimal fetch wrapper that tracks the refresh cookie like a browser would. */
async function call (method, path, { token, body, cookie } = {}) {
    const res = await fetch(`${base}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(cookie ? { Cookie: cookie } : {})
        },
        body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    return {
        status: res.status,
        body: text ? JSON.parse(text) : null,
        cookie: res.headers.getSetCookie?.()?.[0]?.split(";")[0]
    };
}

const loginAs = async (email, password) => call("POST", "/api/auth/login", { body: { email, password } });

async function seedCompany (name = "Acme", email = "admin@acme.test") {
    const su = await loginAs(SUPER.email, SUPER.password);
    const res = await call("POST", "/api/super-admin/companies", {
        token: su.body.accessToken,
        body: { name, email, password: "adminpass123" }
    });
    return { superToken: su.body.accessToken, company: res.body.company, res };
}

test("super admin logs in with env credentials", async () => {
    const res = await loginAs(SUPER.email, SUPER.password);
    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, "super_admin");
});

test("super admin creates a company, and that company can log in as admin", async () => {
    const { company } = await seedCompany();
    assert.equal(company.slug, "acme");

    const admin = await loginAs("admin@acme.test", "adminpass123");
    assert.equal(admin.status, 200);
    assert.equal(admin.body.user.role, "admin");
});

test("duplicate company email returns 409, not 500", async () => {
    const { superToken } = await seedCompany();
    const dup = await call("POST", "/api/super-admin/companies", {
        token: superToken,
        body: { name: "Other", email: "admin@acme.test", password: "adminpass123" }
    });
    assert.equal(dup.status, 409);
});

test("two companies with the same name get distinct slugs", async () => {
    const { superToken } = await seedCompany("Acme", "a@acme.test");
    const second = await call("POST", "/api/super-admin/companies", {
        token: superToken,
        body: { name: "Acme", email: "b@acme.test", password: "adminpass123" }
    });
    assert.equal(second.status, 201);
    assert.equal(second.body.company.slug, "acme-1");
});

test("admin creates a vendor scoped to its own company", async () => {
    await seedCompany();
    const admin = await loginAs("admin@acme.test", "adminpass123");

    const created = await call("POST", "/api/admin/users", {
        token: admin.body.accessToken,
        body: { name: "Vee", email: "vee@acme.test", role: "vendor" }
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.user.role, "vendor");

    const list = await call("GET", "/api/admin/users", { token: admin.body.accessToken });
    assert.equal(list.body.users.length, 1);
    assert.equal(list.body.total, 1);
});

test("an admin cannot see or touch another company's users", async () => {
    const { superToken } = await seedCompany("Acme", "admin@acme.test");
    await call("POST", "/api/super-admin/companies", {
        token: superToken,
        body: { name: "Globex", email: "admin@globex.test", password: "adminpass123" }
    });

    const acme = await loginAs("admin@acme.test", "adminpass123");
    await call("POST", "/api/admin/users", {
        token: acme.body.accessToken,
        body: { name: "Vee", email: "vee@acme.test", role: "vendor" }
    });

    const globex = await loginAs("admin@globex.test", "adminpass123");
    const list = await call("GET", "/api/admin/users", { token: globex.body.accessToken });
    assert.equal(list.body.users.length, 0, "Globex must not see Acme's vendor");
});

test("customer self-registers, applies for vendor, and admin approves", async () => {
    await seedCompany();

    const reg = await call("POST", "/api/auth/register", {
        body: { name: "Cee", email: "cee@acme.test", password: "custpass123", tenantSlug: "acme" }
    });
    assert.equal(reg.status, 201);
    assert.equal(reg.body.user.role, "customer");

    const applied = await call("POST", "/api/customer/vendor-application", {
        token: reg.body.accessToken,
        body: { businessName: "Cee Traders" }
    });
    assert.equal(applied.status, 201);

    // Applying twice while pending is rejected.
    const again = await call("POST", "/api/customer/vendor-application", {
        token: reg.body.accessToken,
        body: { businessName: "Cee Traders" }
    });
    assert.equal(again.status, 409);

    const admin = await loginAs("admin@acme.test", "adminpass123");
    const pending = await call("GET", "/api/admin/vendor-applications", { token: admin.body.accessToken });
    assert.equal(pending.body.applications.length, 1);

    const decided = await call("PATCH", `/api/admin/vendor-applications/${pending.body.applications[0]._id}`, {
        token: admin.body.accessToken,
        body: { decision: "approved" }
    });
    assert.equal(decided.status, 200);
    assert.equal(decided.body.user.role, "vendor");

    // The upgraded account now authenticates as a vendor.
    const asVendor = await loginAs("cee@acme.test", "custpass123");
    assert.equal(asVendor.body.user.role, "vendor");
});

test("an admin cannot decide another company's vendor application", async () => {
    const { superToken } = await seedCompany("Acme", "admin@acme.test");
    await call("POST", "/api/super-admin/companies", {
        token: superToken,
        body: { name: "Globex", email: "admin@globex.test", password: "adminpass123" }
    });

    const reg = await call("POST", "/api/auth/register", {
        body: { name: "Cee", email: "cee@acme.test", password: "custpass123", tenantSlug: "acme" }
    });
    await call("POST", "/api/customer/vendor-application", {
        token: reg.body.accessToken,
        body: { businessName: "Cee Traders" }
    });

    const globex = await loginAs("admin@globex.test", "adminpass123");
    const stolen = await call("PATCH", `/api/admin/vendor-applications/${reg.body.user.id}`, {
        token: globex.body.accessToken,
        body: { decision: "approved" }
    });
    assert.equal(stolen.status, 404, "cross-tenant approval must not succeed");
});

test("suspending a user blocks login AND stops their refresh token working", async () => {
    await seedCompany();
    const admin = await loginAs("admin@acme.test", "adminpass123");

    const reg = await call("POST", "/api/auth/register", {
        body: { name: "Cee", email: "cee@acme.test", password: "custpass123", tenantSlug: "acme" }
    });
    const refreshCookie = reg.cookie;
    assert.ok(refreshCookie, "register should set a refresh cookie");

    // Refresh works while active.
    const before = await call("POST", "/api/auth/refresh", { cookie: refreshCookie });
    assert.equal(before.status, 200);

    await call("PATCH", `/api/admin/users/${reg.body.user.id}/status`, {
        token: admin.body.accessToken,
        body: { status: "suspended" }
    });

    const relogin = await loginAs("cee@acme.test", "custpass123");
    assert.equal(relogin.status, 403);

    // The regression this guards: a stateless refresh token outliving suspension.
    const after = await call("POST", "/api/auth/refresh", { cookie: refreshCookie });
    assert.equal(after.status, 401, "suspended user must not refresh a new access token");
});

test("suspending a company cascades to its users", async () => {
    const { superToken, company } = await seedCompany();
    const reg = await call("POST", "/api/auth/register", {
        body: { name: "Cee", email: "cee@acme.test", password: "custpass123", tenantSlug: "acme" }
    });

    await call("PATCH", `/api/super-admin/companies/${company.id}/status`, {
        token: superToken,
        body: { status: "suspended" }
    });

    const relogin = await loginAs("cee@acme.test", "custpass123");
    assert.equal(relogin.status, 403, "user of a suspended store must not log in");

    const refreshed = await call("POST", "/api/auth/refresh", { cookie: reg.cookie });
    assert.equal(refreshed.status, 401, "suspended store must invalidate refreshes");
});

test("change-password rotates the credential", async () => {
    await seedCompany();
    const reg = await call("POST", "/api/auth/register", {
        body: { name: "Cee", email: "cee@acme.test", password: "custpass123", tenantSlug: "acme" }
    });

    const wrong = await call("POST", "/api/auth/change-password", {
        token: reg.body.accessToken,
        body: { currentPassword: "notitatall", newPassword: "brandnew123" }
    });
    assert.equal(wrong.status, 401);

    const ok = await call("POST", "/api/auth/change-password", {
        token: reg.body.accessToken,
        body: { currentPassword: "custpass123", newPassword: "brandnew123" }
    });
    assert.equal(ok.status, 200);

    assert.equal((await loginAs("cee@acme.test", "custpass123")).status, 401);
    assert.equal((await loginAs("cee@acme.test", "brandnew123")).status, 200);
});

test("role boundaries are enforced across portals", async () => {
    await seedCompany();
    const admin = await loginAs("admin@acme.test", "adminpass123");

    const escalation = await call("GET", "/api/super-admin/companies", { token: admin.body.accessToken });
    assert.equal(escalation.status, 403, "admin must not reach super-admin routes");

    assert.equal((await call("GET", "/api/admin/users")).status, 401, "anonymous must be rejected");
});

test("malformed ids and query params return 4xx, never a 500", async () => {
    const su = await loginAs(SUPER.email, SUPER.password);
    const token = su.body.accessToken;

    const badId = await call("PATCH", "/api/super-admin/companies/not-an-id/status", {
        token,
        body: { status: "active" }
    });
    assert.equal(badId.status, 400);

    // Express's simple parser turns a repeated key into an array; Mongoose would 500 on it.
    const badQuery = await call("GET", "/api/super-admin/users?companyId=a&companyId=b", { token });
    assert.equal(badQuery.status, 400);

    const badLimit = await call("GET", "/api/super-admin/users?limit=99999", { token });
    assert.equal(badLimit.status, 400);
});

test("password hashes never leave the API", async () => {
    await seedCompany();
    const admin = await loginAs("admin@acme.test", "adminpass123");
    await call("POST", "/api/admin/users", {
        token: admin.body.accessToken,
        body: { name: "Vee", email: "vee@acme.test", role: "vendor" }
    });

    const list = await call("GET", "/api/admin/users", { token: admin.body.accessToken });
    assert.ok(!JSON.stringify(list.body).includes("passwordHash"), "passwordHash must not be serialised");

    const su = await loginAs(SUPER.email, SUPER.password);
    const companies = await call("GET", "/api/super-admin/companies", { token: su.body.accessToken });
    assert.ok(!JSON.stringify(companies.body).includes("passwordHash"));
});
