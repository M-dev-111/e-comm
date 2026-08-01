import mongoose from "mongoose";
import { env } from "./env.js";

mongoose.set("strictQuery", true);

let connecting = null;

/* MONGO_URI is optional at boot (see env.js) so the AI routes keep working
   even before the RBAC layer is configured. Callers that need the DB should
   check isDbReady() and respond 503 rather than throwing into the AI routes'
   error handler. */
export function isDbReady () {
    return mongoose.connection.readyState === 1;
}

export async function connectDb () {
    if (!env.MONGO_URI) {
        console.warn("MONGO_URI not set — auth/admin/vendor/customer routes will return 503.");
        return null;
    }
    if (connecting) return connecting;

    connecting = mongoose.connect(env.MONGO_URI)
        .then(conn => {
            console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
            return conn;
        })
        .catch(error => {
            connecting = null;
            console.error("MongoDB connection failed:", error.message);
            return null;
        });

    return connecting;
}

/** Closes the pool on shutdown so in-flight writes finish first. */
export async function disconnectDb () {
    if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
}

/** 503s a request instead of letting a route crash on a missing DB connection. */
export function requireDb (req, res, next) {
    if (!isDbReady()) {
        return res.status(503).json({ error: "Database is not configured yet. Set MONGO_URI and restart the server." });
    }
    next();
}
