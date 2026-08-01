import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter = null;
if (env.smtpConfigured) {
    transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
    });
}

/**
 * Sends provisioned-account credentials. Falls back to a console log when
 * SMTP isn't configured yet, so admin/vendor/customer creation never breaks
 * in dev just because email isn't wired up.
 */
export async function sendCredentialsEmail ({ to, name, role, email, password, loginPath = "/login" }) {
    const loginUrl = `${env.FRONTEND_URL}${loginPath}`;
    const subject = `Your ${role} account on mCOM`;
    const text =
        `Hi ${name},\n\n` +
        `An mCOM ${role} account has been created for you.\n\n` +
        `Login email: ${email}\n` +
        `Temporary password: ${password}\n` +
        `Log in here: ${loginUrl}\n\n` +
        `Please change your password after logging in.`;

    if (!transporter) {
        console.log(`[mailer] SMTP not configured — credentials for ${to}:\n${text}`);
        return { delivered: false };
    }

    await transporter.sendMail({ from: env.MAIL_FROM, to, subject, text });
    return { delivered: true };
}
