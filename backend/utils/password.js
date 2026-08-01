import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 12;

export const hashPassword = password => bcrypt.hash(password, SALT_ROUNDS);
export const comparePassword = (password, hash) => bcrypt.compare(password, hash);

const WORDS = [
    "orbit", "cedar", "flint", "amber", "vivid", "quartz", "coral", "azure", "maple", "delta",
    "harbor", "onyx", "willow", "cobalt", "ember", "topaz", "lunar", "spruce", "garnet", "meadow",
    "vertex", "cirrus", "basalt", "indigo", "juniper", "marble", "nimbus", "opal", "pewter", "raven",
    "saffron", "thistle", "umber", "violet", "walnut", "zephyr", "beacon", "canyon", "drift", "falcon"
];

/**
 * Human-typeable temp password for provisioned accounts, e.g. "cedar-harbor-flint-84213!".
 *
 * Three words from a 40-word list plus five digits is ~32 bits — enough that a
 * credential sitting in an inbox isn't guessable, while staying easy to retype.
 * These are meant to be replaced via POST /api/auth/change-password.
 */
export function generateTempPassword () {
    const words = Array.from({ length: 3 }, () => WORDS[crypto.randomInt(WORDS.length)]);
    const digits = crypto.randomInt(10000, 99999);
    return `${words.join("-")}-${digits}!`;
}
