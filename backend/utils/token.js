import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Access/refresh tokens carry:
 *   sub     — the account's Mongo _id, or "super_admin" for the static account
 *   role    — "super_admin" | "admin" | "vendor" | "customer"
 *   company — Company _id as a string, or null for super_admin
 */
export const signAccessToken = payload =>
    jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_TTL });

export const signRefreshToken = payload =>
    jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_TTL });

export const verifyAccessToken = token => jwt.verify(token, env.JWT_ACCESS_SECRET);
export const verifyRefreshToken = token => jwt.verify(token, env.JWT_REFRESH_SECRET);
