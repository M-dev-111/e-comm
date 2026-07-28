/** Shape a User document for the client (password is select:false already). */
export function presentUser (user) {
    if (!user) return null;
    const company = user.company && user.company._id
        ? { id: String(user.company._id), name: user.company.name, slug: user.company.slug }
        : user.company
            ? { id: String(user.company) }
            : null;
    return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        company,
        createdAt: user.createdAt
    };
}
