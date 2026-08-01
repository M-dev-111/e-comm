import slugify from "slugify";
import Company from "../models/Company.js";
import User from "../models/User.js";
import { hashPassword, generateTempPassword } from "../utils/password.js";
import { sendCredentialsEmail } from "../utils/mailer.js";

async function uniqueSlug (name) {
    const base = slugify(name, { lower: true, strict: true }) || "company";
    let slug = base;
    let n = 1;
    // Small tenant count expected; a linear probe is fine here.
    while (await Company.exists({ slug })) {
        slug = `${base}-${n++}`;
    }
    return slug;
}

/** Super-admin-only: creates a Company, which doubles as the admin account. */
export async function createCompanyWithAdmin ({ name, email, password, logo }) {
    const passwordHash = await hashPassword(password);
    const slug = await uniqueSlug(name);

    const company = await Company.create({ name, email, passwordHash, logo: logo ?? null, slug });

    const { delivered } = await sendCredentialsEmail({
        to: email,
        name,
        role: "admin",
        email,
        password,
        loginPath: "/admin/login"
    });

    return { company, emailDelivered: delivered };
}

/** Admin or super-admin: creates a vendor/customer under a specific company. */
export async function createProvisionedUser ({ name, email, role, companyId, createdBy }) {
    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    const user = await User.create({
        name,
        email,
        passwordHash,
        role,
        company: companyId,
        createdBy
    });

    const { delivered } = await sendCredentialsEmail({
        to: email,
        name,
        role,
        email,
        password: tempPassword,
        loginPath: role === "vendor" ? "/vendor/login" : "/login"
    });

    return { user, emailDelivered: delivered };
}
