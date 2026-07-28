/**
 * Role-based access control. Use after `authenticate`.
 *
 *   router.post("/", authenticate, requireRole("admin", "vendor"), handler)
 */
export const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required." });
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: "You do not have permission to do that." });
    }
    next();
};

/**
 * Tenant scoping helper. Returns the base filter every list/read query should
 * start from: the super admin sees everything ({}), everyone else is locked to
 * their own company. An optional `?company=` override lets the super admin
 * narrow to one tenant.
 */
export function tenantFilter (req) {
    if (req.user.role === "superadmin") {
        return req.query.company ? { company: req.query.company } : {};
    }
    return { company: req.companyId };
}

/**
 * Assert a loaded document belongs to the requester's tenant (super admin
 * bypasses). Returns true when access is allowed.
 */
export function ownsTenant (req, doc) {
    if (!doc) return false;
    if (req.user.role === "superadmin") return true;
    const docCompany = doc.company?._id ? String(doc.company._id) : String(doc.company);
    return docCompany === req.companyId;
}
