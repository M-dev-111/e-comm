import crypto from "crypto";
import { env } from "../config/env.js";
import { signAccessToken, signRefreshToken } from "./token.js";

const REFRESH_COOKIE = "mcom_refresh";

export function setRefreshCookie (res, token) {
    res.cookie(REFRESH_COOKIE, token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth/refresh",
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30d ceiling; actual expiry enforced by the JWT itself
    });
}

export function clearRefreshCookie (res) {
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth/refresh" });
}

export const refreshCookieName = REFRESH_COOKIE;

/** Issues both tokens for a resolved identity and sets the refresh cookie. */
export function issueSession (res, { sub, role, company }) {
    const payload = { sub, role, company };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    setRefreshCookie(res, refreshToken);
    return accessToken;
}

/** Constant-time compare for the env-based super admin password. */
export function safeEqual (a, b) {
    const bufA = Buffer.from(String(a));
    const bufB = Buffer.from(String(b));
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}
