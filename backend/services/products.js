import slugify from "slugify";
import Product from "../models/Product.js";

/** Slugs only need to be unique within a company, not platform-wide. */
export async function uniqueProductSlug (companyId, name) {
    const base = slugify(name, { lower: true, strict: true }) || "product";
    let slug = base;
    let n = 1;
    while (await Product.exists({ company: companyId, slug })) {
        slug = `${base}-${n++}`;
    }
    return slug;
}
