import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/** Sign a compact token carrying just the identity we need on every request. */
export function signToken (user) {
    return jwt.sign(
        {
            sub: String(user._id),
            role: user.role,
            company: user.company ? String(user.company) : null
        },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES }
    );
}

export function verifyToken (token) {
    return jwt.verify(token, env.JWT_SECRET);
}
